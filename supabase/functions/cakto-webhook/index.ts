import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type CaktoPayload = {
  secret?: string;
  event?: string;
  data?: {
    id?: string;
    customer?: { email?: string };
  };
};

const statusByEvent: Record<string, {
  status: 'active' | 'past_due' | 'canceled' | 'refunded' | 'charged_back';
  cancelAtPeriodEnd: boolean;
}> = {
  purchase_approved: { status: 'active', cancelAtPeriodEnd: false },
  subscription_created: { status: 'active', cancelAtPeriodEnd: false },
  subscription_renewed: { status: 'active', cancelAtPeriodEnd: false },
  subscription_renewal_refused: { status: 'past_due', cancelAtPeriodEnd: false },
  purchase_refused: { status: 'past_due', cancelAtPeriodEnd: false },
  subscription_canceled: { status: 'canceled', cancelAtPeriodEnd: true },
  refund: { status: 'refunded', cancelAtPeriodEnd: true },
  chargeback: { status: 'charged_back', cancelAtPeriodEnd: true },
};

function sameSecret(received: string | undefined, expected: string | undefined) {
  if (!received || !expected || received.length !== expected.length) return false;

  let difference = 0;
  for (let index = 0; index < received.length; index += 1) {
    difference |= received.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}

async function eventKey(event: string, purchaseId: string | undefined, payload: CaktoPayload) {
  if (purchaseId) return `cakto:${event}:${purchaseId}`;
  const encoded = new TextEncoder().encode(JSON.stringify({ event, data: payload.data }));
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return `cakto:${event}:${Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
  }

  let payload: CaktoPayload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (!sameSecret(payload.secret, Deno.env.get('CAKTO_WEBHOOK_TOKEN'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const event = payload.event;
  if (!event) return Response.json({ error: 'Missing event' }, { status: 400 });

  const email = payload.data?.customer?.email?.trim().toLowerCase() ?? null;
  const purchaseId = payload.data?.id;
  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const key = await eventKey(event, purchaseId, payload);
  const { error: insertEventError } = await db.from('payment_events').insert({
    provider: 'cakto',
    event_key: key,
    event_type: event,
    provider_purchase_id: purchaseId ?? null,
    customer_email: email,
  });

  if (insertEventError?.code === '23505') {
    return Response.json({ received: true, duplicate: true });
  }
  if (insertEventError) {
    console.error('Could not save Cakto event', insertEventError.code);
    return Response.json({ error: 'Could not record event' }, { status: 500 });
  }

  const subscriptionChange = statusByEvent[event];
  if (!subscriptionChange) {
    await db.from('payment_events').update({ processed_at: new Date().toISOString() }).eq('event_key', key);
    return Response.json({ received: true, ignored: true });
  }

  if (!email) {
    await db.from('payment_events').update({ processing_error: 'Cakto event has no customer email' }).eq('event_key', key);
    return Response.json({ received: true, linked: false });
  }

  const { data: users, error: usersError } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (usersError) {
    await db.from('payment_events').update({ processing_error: 'Could not find auth user' }).eq('event_key', key);
    return Response.json({ error: 'Could not match user' }, { status: 500 });
  }

  const user = users.users.find((candidate) => candidate.email?.trim().toLowerCase() === email);
  if (!user) {
    await db.from('payment_events').update({ processing_error: 'No auth user with this email' }).eq('event_key', key);
    return Response.json({ received: true, linked: false });
  }

  const now = new Date().toISOString();
  const { error: subscriptionError } = await db.from('subscriptions').upsert({
    user_id: user.id,
    provider: 'cakto',
    provider_customer_id: email,
    status: subscriptionChange.status,
    cancel_at_period_end: subscriptionChange.cancelAtPeriodEnd,
    updated_at: now,
  }, { onConflict: 'user_id' });

  if (subscriptionError) {
    await db.from('payment_events').update({ processing_error: 'Could not update subscription' }).eq('event_key', key);
    console.error('Could not update subscription', subscriptionError.code);
    return Response.json({ error: 'Could not update subscription' }, { status: 500 });
  }

  await db.from('payment_events').update({ processed_at: now }).eq('event_key', key);
  return Response.json({ received: true, linked: true });
});
