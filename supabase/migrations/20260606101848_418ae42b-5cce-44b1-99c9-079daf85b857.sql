
-- Allow permitted admins to manage chapter/quotes/recognition assets in the avatars bucket

CREATE POLICY "chapter logo upload" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'chapter'
  AND public.has_permission(auth.uid(), 'profile.chapter.edit'));

CREATE POLICY "chapter logo update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'chapter'
  AND public.has_permission(auth.uid(), 'profile.chapter.edit'));

CREATE POLICY "chapter logo delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'chapter'
  AND public.has_permission(auth.uid(), 'profile.chapter.edit'));

CREATE POLICY "quotes photo upload" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'quotes'
  AND public.has_permission(auth.uid(), 'quotes.manage'));

CREATE POLICY "quotes photo update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'quotes'
  AND public.has_permission(auth.uid(), 'quotes.manage'));

CREATE POLICY "quotes photo delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'quotes'
  AND public.has_permission(auth.uid(), 'quotes.manage'));

CREATE POLICY "recognition photo upload" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'recognition'
  AND public.has_permission(auth.uid(), 'recognition.manage'));

CREATE POLICY "recognition photo update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'recognition'
  AND public.has_permission(auth.uid(), 'recognition.manage'));

CREATE POLICY "recognition photo delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'recognition'
  AND public.has_permission(auth.uid(), 'recognition.manage'));
