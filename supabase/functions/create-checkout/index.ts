import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (request) => {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: { user } } = await db.auth.getUser(token);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const checkout = Deno.env.get('CAKTO_CHECKOUT_URL');
  if (!checkout?.startsWith('https://pay.cakto.com.br/')) {
    return Response.json({ error: 'Checkout Cakto não configurado.' }, { status: 503 });
  }

  // A Cakto não documenta suporte a external_reference neste checkout público.
  // O webhook vincula a compra ao usuário autenticado pelo mesmo e-mail da compra.
  return Response.json({ url: checkout });
});
