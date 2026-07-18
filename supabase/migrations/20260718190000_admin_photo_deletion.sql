-- A administraÃ§Ã£o de fotos usa o papel no banco, nunca o e-mail do usuÃ¡rio.
create policy "admins delete beach photos"
  on public.beach_photos for delete to authenticated
  using ((select private.is_admin()));

drop policy if exists "owner deletes beach gallery images" on storage.objects;
drop policy if exists "owner reads beach gallery upload metadata" on storage.objects;
drop policy if exists "owner uploads beach gallery images" on storage.objects;

create policy "admins read beach gallery upload metadata"
  on storage.objects for select to authenticated
  using (bucket_id = 'beach-gallery' and (select private.is_admin()));

create policy "admins upload beach gallery images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'beach-gallery' and (select private.is_admin()));

create policy "admins delete beach gallery images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'beach-gallery' and (select private.is_admin()));
