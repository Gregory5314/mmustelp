
-- Albums group photos uploaded together (batch)
CREATE TABLE public.gallery_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_albums TO authenticated;
GRANT ALL ON public.gallery_albums TO service_role;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read albums" ON public.gallery_albums FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert own albums" ON public.gallery_albums FOR INSERT TO authenticated WITH CHECK (uploader_id = auth.uid());
CREATE POLICY "update own albums" ON public.gallery_albums FOR UPDATE TO authenticated USING (uploader_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "delete own albums" ON public.gallery_albums FOR DELETE TO authenticated USING (uploader_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- Link photos to albums + store title/position
ALTER TABLE public.gallery_photos
  ADD COLUMN album_id uuid REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
  ADD COLUMN title text,
  ADD COLUMN position int NOT NULL DEFAULT 0;
CREATE INDEX gallery_photos_album_idx ON public.gallery_photos(album_id);

-- Reactions (one per user per album, simple heart)
CREATE TABLE public.gallery_reactions (
  album_id uuid NOT NULL REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL DEFAULT '❤️',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (album_id, user_id, emoji)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_reactions TO authenticated;
GRANT ALL ON public.gallery_reactions TO service_role;
ALTER TABLE public.gallery_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read reactions" ON public.gallery_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "own reactions insert" ON public.gallery_reactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own reactions delete" ON public.gallery_reactions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Comments
CREATE TABLE public.gallery_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_comments TO authenticated;
GRANT ALL ON public.gallery_comments TO service_role;
ALTER TABLE public.gallery_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read comments" ON public.gallery_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert own comments" ON public.gallery_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete own comments" ON public.gallery_comments FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE INDEX gallery_comments_album_idx ON public.gallery_comments(album_id, created_at);
