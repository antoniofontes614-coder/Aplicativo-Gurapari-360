alter table public.beach_photos add column display_order integer;

with ordered_photos as (
  select id, row_number() over (partition by beach_slug order by created_at, id) as position
  from public.beach_photos
)
update public.beach_photos
set display_order = ordered_photos.position
from ordered_photos
where public.beach_photos.id = ordered_photos.id;

alter table public.beach_photos
  alter column display_order set not null,
  alter column display_order set default 1,
  add constraint beach_photos_display_order_positive check (display_order > 0);

create index beach_photos_beach_slug_display_order_idx
  on public.beach_photos (beach_slug, display_order);

create policy "admins update beach photos"
  on public.beach_photos for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
