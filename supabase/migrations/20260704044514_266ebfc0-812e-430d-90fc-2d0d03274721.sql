
CREATE TABLE public.link_images (
  link_key text PRIMARY KEY,
  image_url text NOT NULL,
  storage_path text,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.link_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.link_images TO authenticated;
GRANT ALL ON public.link_images TO service_role;

ALTER TABLE public.link_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view link images" ON public.link_images FOR SELECT USING (true);
CREATE POLICY "Admins can insert link images" ON public.link_images FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update link images" ON public.link_images FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete link images" ON public.link_images FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER link_images_updated_at BEFORE UPDATE ON public.link_images
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Allow admins to upload/manage files under links/ in event_photos bucket
CREATE POLICY "Admins can upload link background images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'event_photos' AND (storage.foldername(name))[1] = 'links' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update link background images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'event_photos' AND (storage.foldername(name))[1] = 'links' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete link background images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'event_photos' AND (storage.foldername(name))[1] = 'links' AND public.has_role(auth.uid(), 'admin'));
