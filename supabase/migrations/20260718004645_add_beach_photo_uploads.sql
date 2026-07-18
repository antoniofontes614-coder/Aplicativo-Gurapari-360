-- Baseline do schema que já existia no projeto remoto.
-- Mantida no repositório para que migrations futuras partam do mesmo histórico.

create extension if not exists pgcrypto;

create table public.beach_photos (
  id uuid primary key default gen_random_uuid(),
  beach_slug text not null,
  storage_path text not null unique,
  caption text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.beach_photos enable row level security;

grant select on public.beach_photos to anon, authenticated;
grant insert on public.beach_photos to authenticated;

create policy "beach photos are public"
  on public.beach_photos for select to anon, authenticated
  using (true);
