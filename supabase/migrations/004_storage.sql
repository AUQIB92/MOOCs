-- 004_storage.sql
-- MOOC Management Platform - Storage Buckets and Policies

-- ============================================
-- STORAGE BUCKETS
-- ============================================
insert into storage.buckets (id, name, public) values
  ('registration-proofs', 'registration-proofs', false),
  ('certificates', 'certificates', false),
  ('result-pdfs', 'result-pdfs', false),
  ('avatars', 'avatars', true);

-- ============================================
-- REGISTRATION PROOFS
-- ============================================
create policy "Students can upload registration proofs"
  on storage.objects for insert with check (
    bucket_id = 'registration-proofs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Students can view own registration proofs"
  on storage.objects for select using (
    bucket_id = 'registration-proofs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Admins and faculty can view registration proofs"
  on storage.objects for select using (
    bucket_id = 'registration-proofs'
    and exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'faculty_coordinator')
    )
  );

-- ============================================
-- CERTIFICATES
-- ============================================
create policy "Students can upload certificates"
  on storage.objects for insert with check (
    bucket_id = 'certificates'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Students can view own certificates"
  on storage.objects for select using (
    bucket_id = 'certificates'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Admins and faculty can view certificates"
  on storage.objects for select using (
    bucket_id = 'certificates'
    and exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'faculty_coordinator')
    )
  );

-- ============================================
-- RESULT PDFS
-- ============================================
create policy "Students can upload result PDFs"
  on storage.objects for insert with check (
    bucket_id = 'result-pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Students can view own result PDFs"
  on storage.objects for select using (
    bucket_id = 'result-pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Admins and faculty can view result PDFs"
  on storage.objects for select using (
    bucket_id = 'result-pdfs'
    and exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'faculty_coordinator')
    )
  );

-- ============================================
-- AVATARS
-- ============================================
create policy "Users can upload own avatar"
  on storage.objects for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own avatar"
  on storage.objects for update with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Anyone can view avatars"
  on storage.objects for select using (bucket_id = 'avatars');
