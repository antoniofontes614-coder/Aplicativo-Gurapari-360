import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type UserSummary = { id: string; email?: string | null; created_at: string; };
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: { user }, error: userError } = await admin.auth.getUser(token);
  if (userError || !user) return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  const { data: callerRole } = await admin.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
  if (callerRole?.role !== 'admin') return new Response('Forbidden', { status: 403, headers: corsHeaders });
  const { data: page, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) return new Response('Unable to list users', { status: 500, headers: corsHeaders });
  const users = (page.users as UserSummary[]);
  const ids = users.map((item) => item.id);
  const [{ data: roles }, { data: subscriptions }] = await Promise.all([
    admin.from('user_roles').select('user_id, role').in('user_id', ids),
    admin.from('subscriptions').select('user_id, status, current_period_end').in('user_id', ids),
  ]);
  const roleByUser = new Map((roles ?? []).map((item) => [item.user_id, item.role]));
  const subscriptionByUser = new Map((subscriptions ?? []).map((item) => [item.user_id, item]));
  return Response.json({ users: users.map((item) => ({ id: item.id, email: item.email ?? null, created_at: item.created_at, role: roleByUser.get(item.id) ?? 'member', subscription_status: subscriptionByUser.get(item.id)?.status ?? null, current_period_end: subscriptionByUser.get(item.id)?.current_period_end ?? null })) }, { headers: corsHeaders });
});
