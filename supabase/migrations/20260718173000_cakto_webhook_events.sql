-- Eventos de pagamento sÃ£o gravados apenas pela Edge Function com service role.
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_key text not null unique,
  event_type text not null,
  provider_purchase_id text,
  customer_email text,
  processing_error text,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.payment_events enable row level security;
revoke all on table public.payment_events from anon, authenticated;

-- A interface do aplicativo usa maybeSingle para a assinatura do usuÃ¡rio.
-- Uma Ãºnica assinatura Cakto Ã© mantida por usuÃ¡rio para tornar as atualizaÃ§Ãµes idempotentes.
alter table public.subscriptions
  add constraint subscriptions_user_id_key unique (user_id);
