-- ============================================================================
-- Storage bucket for maintenance request images
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('maintenance-images', 'maintenance-images', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload maintenance images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'maintenance-images');

create policy "Anyone can view maintenance images"
  on storage.objects for select
  using (bucket_id = 'maintenance-images');

create policy "Owners can delete their own maintenance images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'maintenance-images' and owner = auth.uid());

-- Avatars bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars');

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');
