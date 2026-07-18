-- Base de autenticação e autorização. Não inclui cobrança, checkout ou webhooks.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscription_plans (
  code text primary key,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_code text references public.subscription_plans(code),
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  status text not null default 'pending' check (status in ('pending', 'active', 'past_due', 'canceled', 'expired', 'refunded', 'charged_back')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  next_charge_at timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (provider, provider_subscription_id)
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);
create index if not exists subscriptions_plan_code_idx on public.subscriptions(plan_code);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtext('guarapari360:first-admin'));

  insert into public.profiles (id, display_name)
  values (new.id, nullif(trim(coalesce(new.raw_user_meta_data ->> 'first_name', '')), ''))
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, case when exists (select 1 from public.user_roles where role = 'admin') then 'member' else 'admin' end)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists user_roles_set_updated_at on public.user_roles;
create trigger user_roles_set_updated_at
  before update on public.user_roles
  for each row execute procedure public.set_updated_at();

drop trigger if exists subscription_plans_set_updated_at on public.subscription_plans;
create trigger subscription_plans_set_updated_at
  before update on public.subscription_plans
  for each row execute procedure public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.user_roles from anon, authenticated;
revoke all on table public.subscription_plans from anon, authenticated;
revoke all on table public.subscriptions from anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant select on public.subscription_plans to anon, authenticated;
grant select on public.subscriptions to authenticated;

drop policy if exists "users read their own profile" on public.profiles;
create policy "users read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "users update their own profile" on public.profiles;
create policy "users update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "active plans are publicly readable" on public.subscription_plans;
create policy "active plans are publicly readable"
  on public.subscription_plans for select to anon, authenticated
  using (active = true);

drop policy if exists "users read their own subscriptions" on public.subscriptions;
create policy "users read their own subscriptions"
  on public.subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "roles are server managed" on public.user_roles;
create policy "roles are server managed"
  on public.user_roles for select to authenticated
  using ((select auth.uid()) = user_id);

insert into public.profiles (id, display_name)
select id, nullif(trim(coalesce(raw_user_meta_data ->> 'first_name', '')), '')
from auth.users
on conflict (id) do nothing;

insert into public.user_roles (user_id)
select id
from auth.users
on conflict (user_id) do nothing;

-- A conta administrativa existente continua podendo enviar fotos, porém a
-- autorização agora é mantida no banco, e não por e-mail exposto no cliente.
drop policy if exists "owner uploads beach photos" on public.beach_photos;
create policy "admins upload beach photos"
  on public.beach_photos for insert to authenticated
  with check ((select private.is_admin()) and (select auth.uid()) = created_by);

drop function if exists public.is_admin();
