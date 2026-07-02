import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuth } from "@/hooks/use-auth";
import { BookOpen, Download, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/constitution")({
  head: () => ({
    meta: [
      { title: "MMUST ELC Constitution — MMUST ELP" },
      { name: "description", content: "Download the MMUST ELC constitution." },
    ],
  }),
  component: ConstitutionPage,
});

type Doc = {
  id: string;
  title: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  updated_at: string;
};

const SLUG = "constitution";
const BUCKET = "chapter_documents";
const MAX_MB = 20;

function ConstitutionPage() {
  const { user } = useAuth();
  const { has } = usePermissions();
  const canManage = has("constitution.manage");
  const [doc, setDoc] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("chapter_documents")
      .select("id, title, storage_path, file_name, mime_type, size_bytes, updated_at")
      .eq("slug", SLUG)
      .maybeSingle();
    setDoc((data as Doc | null) ?? null);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const download = async () => {
    if (!doc) return;
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(doc.storage_path, 60, { download: doc.file_name });
    if (error || !data?.signedUrl) return toast.error("Could not generate download link.");
    window.location.href = data.signedUrl;
  };

  const onUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;
    if (file.size > MAX_MB * 1024 * 1024) return toast.error(`File must be under ${MAX_MB}MB`);
    setBusy(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
    const path = `constitution/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type });
    if (upErr) { setBusy(false); return toast.error(upErr.message); }

    const payload = {
      slug: SLUG,
      title: "MMUST ELC Constitution",
      storage_path: path,
      file_name: file.name,
      mime_type: file.type || null,
      size_bytes: file.size,
      uploaded_by: user.id,
      updated_at: new Date().toISOString(),
    };
    const { error: dbErr } = doc
      ? await supabase.from("chapter_documents").update(payload).eq("id", doc.id)
      : await supabase.from("chapter_documents").insert(payload);
    if (dbErr) { setBusy(false); return toast.error(dbErr.message); }

    // Clean up previous file
    if (doc?.storage_path && doc.storage_path !== path) {
      await supabase.storage.from(BUCKET).remove([doc.storage_path]);
    }
    setBusy(false);
    setFile(null);
    toast.success("Constitution updated.");
    load();
  };

  return (
    <AppLayout title="MMUST ELC Constitution" subtitle="Official chapter constitution.">
      <Toaster />
      <section className="px-4 mt-4">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-[var(--brand)]/10 text-[var(--brand)] flex items-center justify-center">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-extrabold text-[var(--brand)]">MMUST ELC Constitution</h2>
              {loading ? (
                <p className="text-xs text-muted-foreground">Loading…</p>
              ) : doc ? (
                <p className="text-xs text-muted-foreground truncate">
                  {doc.file_name}
                  {doc.size_bytes ? ` • ${(doc.size_bytes / 1024 / 1024).toFixed(2)} MB` : ""}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Not uploaded yet.</p>
              )}
              {doc && (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Updated {new Date(doc.updated_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {doc && (
            <button
              onClick={download}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-[var(--brand)] text-brand-foreground font-bold py-2.5 rounded-lg shadow hover:bg-[var(--brand-deep)] transition-colors"
            >
              <Download className="h-4 w-4" /> Download
            </button>
          )}
        </div>
      </section>

      {canManage && (
        <section className="px-4 mt-6 pb-6">
          <form
            onSubmit={onUpload}
            className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3"
          >
            <h3 className="text-base font-extrabold text-[var(--brand)] flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {doc ? "Replace constitution" : "Upload constitution"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Only the Chapter President can upload the constitution. PDF or DOC up to {MAX_MB}MB.
            </p>
            <label className="flex items-center gap-3 border border-dashed border-border rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors">
              <FileText className="h-5 w-5 text-[var(--brand-accent)]" />
              <span className="flex-1 text-sm truncate">
                {file ? file.name : "Choose a file…"}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
            <button
              type="submit"
              disabled={busy || !file}
              className="w-full bg-[var(--brand-accent)] text-white font-bold py-2.5 rounded-lg disabled:opacity-60"
            >
              {busy ? "Uploading…" : doc ? "Replace file" : "Upload"}
            </button>
          </form>
        </section>
      )}
    </AppLayout>
  );
}
