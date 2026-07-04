
CREATE TABLE public.gallery_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  uploader_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  caption TEXT,
  file_name TEXT,
  content_type TEXT,
  size_bytes BIGINT,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_photos TO authenticated;
GRANT ALL ON public.gallery_photos TO service_role;

ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view gallery photos"
  ON public.gallery_photos FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can upload their own photos"
  ON public.gallery_photos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Users can update own; admins can update any"
  ON public.gallery_photos FOR UPDATE TO authenticated
  USING (auth.uid() = uploader_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = uploader_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own; admins can delete any"
  ON public.gallery_photos FOR DELETE TO authenticated
  USING (auth.uid() = uploader_id OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX gallery_photos_taken_at_idx ON public.gallery_photos (taken_at DESC);

-- Storage policies on event_photos bucket, gallery/ prefix
CREATE POLICY "Authenticated can view gallery objects"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'event_photos' AND (storage.foldername(name))[1] = 'gallery');

CREATE POLICY "Anyone public can view gallery objects"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'event_photos' AND (storage.foldername(name))[1] = 'gallery');

CREATE POLICY "Users can upload gallery objects"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'event_photos'
    AND (storage.foldername(name))[1] = 'gallery'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

CREATE POLICY "Users can delete own gallery objects; admins any"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'event_photos'
    AND (storage.foldername(name))[1] = 'gallery'
    AND (auth.uid()::text = (storage.foldername(name))[2] OR public.has_role(auth.uid(), 'admin'))
  );
