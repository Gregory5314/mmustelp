
CREATE OR REPLACE FUNCTION public.on_gallery_photo_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uploader_name text;
BEGIN
  SELECT COALESCE(NULLIF(full_name, ''), 'A member') INTO uploader_name
  FROM public.profiles WHERE id = NEW.uploader_id;

  INSERT INTO public.notifications (recipient_id, type, title, body, link)
  SELECT p.id, 'gallery',
    uploader_name || ' shared a new photo',
    COALESCE(NEW.caption, 'Tap to view the latest chapter moment.'),
    '/gallery'
  FROM public.profiles p
  WHERE p.id <> NEW.uploader_id;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_gallery_photo_insert ON public.gallery_photos;
CREATE TRIGGER trg_gallery_photo_insert
AFTER INSERT ON public.gallery_photos
FOR EACH ROW EXECUTE FUNCTION public.on_gallery_photo_insert();
