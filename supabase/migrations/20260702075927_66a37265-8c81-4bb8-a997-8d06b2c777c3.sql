
-- Permission
INSERT INTO public.role_permissions (role, permission)
VALUES ('president', 'constitution.manage')
ON CONFLICT DO NOTHING;

-- Table
CREATE TABLE public.chapter_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chapter_documents TO authenticated;
GRANT ALL ON public.chapter_documents TO service_role;

ALTER TABLE public.chapter_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read chapter documents"
  ON public.chapter_documents FOR SELECT TO authenticated USING (true);

CREATE POLICY "managers insert chapter documents"
  ON public.chapter_documents FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'constitution.manage'));

CREATE POLICY "managers update chapter documents"
  ON public.chapter_documents FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'constitution.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'constitution.manage'));

CREATE POLICY "managers delete chapter documents"
  ON public.chapter_documents FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'constitution.manage'));

CREATE TRIGGER chapter_documents_set_updated_at
  BEFORE UPDATE ON public.chapter_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage policies on chapter_documents bucket
CREATE POLICY "members read chapter_documents storage"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'chapter_documents');

CREATE POLICY "managers upload chapter_documents storage"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chapter_documents'
    AND public.has_permission(auth.uid(), 'constitution.manage'));

CREATE POLICY "managers update chapter_documents storage"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'chapter_documents'
    AND public.has_permission(auth.uid(), 'constitution.manage'))
  WITH CHECK (bucket_id = 'chapter_documents'
    AND public.has_permission(auth.uid(), 'constitution.manage'));

CREATE POLICY "managers delete chapter_documents storage"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'chapter_documents'
    AND public.has_permission(auth.uid(), 'constitution.manage'));
