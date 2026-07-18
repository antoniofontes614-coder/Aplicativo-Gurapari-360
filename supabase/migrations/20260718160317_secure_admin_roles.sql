-- A primeira conta criada recebe admin de forma atômica; as demais são member.
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

revoke all on table public.user_roles from anon, authenticated;
grant select on public.user_roles to authenticated;

drop policy if exists "roles are server managed" on public.user_roles;
create policy "roles are server managed"
  on public.user_roles for select to authenticated
  using ((select auth.uid()) = user_id);
