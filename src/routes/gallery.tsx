import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Upload, Download, Trash2, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Chapter Photo Gallery — MMUST ELP" },
      { name: "description", content: "Chapter photo gallery — upload, view, and download chapter moments." },
    ],
  }),
  component: GalleryPage,
});

type Photo = {
  id: string;
  uploader_id: string;
  storage_path: string;
  public_url: string;
  caption: string | null;
  file_name: string | null;
  taken_at: string;
};

const BUCKET = "event_photos";

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  const name = new Date(y, (m ?? 1) - 1, 1).toLocaleString(undefined, { month: "long" });
  return `${name} Moments · ${y}`;
}

function GalleryPage() {
  const { user, isAdmin } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [zipping, setZipping] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gallery_photos")
      .select("id,uploader_id,storage_path,public_url,caption,file_name,taken_at")
      .order("taken_at", { ascending: false });
    if (error) toast.error(error.message);
    setPhotos((data ?? []) as Photo[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onPick = () => fileRef.current?.click();

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length || !user) return;
    setUploading(true);
    let ok = 0, fail = 0;
    for (const f of files) {
      try {
        if (!f.type.startsWith("image/")) { fail++; continue; }
        const ext = f.name.split(".").pop() || "jpg";
        const path = `gallery/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, f, {
          cacheControl: "31536000",
          upsert: false,
          contentType: f.type,
        });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
        const { error: insErr } = await supabase.from("gallery_photos").insert({
          uploader_id: user.id,
          storage_path: path,
          public_url: pub.publicUrl,
          file_name: f.name,
          content_type: f.type,
          size_bytes: f.size,
        });
        if (insErr) throw insErr;
        ok++;
      } catch (err: any) {
        console.error(err);
        fail++;
      }
    }
    setUploading(false);
    if (ok) toast.success(`Uploaded ${ok} photo${ok > 1 ? "s" : ""}`);
    if (fail) toast.error(`${fail} failed to upload`);
    load();
  };

  const downloadOne = async (p: Photo) => {
    try {
      const res = await fetch(p.public_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = p.file_name || p.storage_path.split("/").pop() || "photo.jpg";
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error("Download failed");
    }
  };

  const downloadGroup = async (key: string, items: Photo[]) => {
    setZipping(key);
    try {
      const zip = new JSZip();
      const folder = zip.folder(monthLabel(key)) ?? zip;
      await Promise.all(items.map(async (p) => {
        const res = await fetch(p.public_url);
        const blob = await res.blob();
        const name = p.file_name || p.storage_path.split("/").pop() || `${p.id}.jpg`;
        folder.file(name, blob);
      }));
      const out = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(out);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${monthLabel(key)}.zip`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${items.length} photos`);
    } catch (err: any) {
      toast.error("Group download failed");
    } finally {
      setZipping(null);
    }
  };

  const deletePhoto = async (p: Photo) => {
    if (!confirm("Delete this photo?")) return;
    const { error: sErr } = await supabase.storage.from(BUCKET).remove([p.storage_path]);
    if (sErr) console.warn(sErr);
    const { error } = await supabase.from("gallery_photos").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    setLightbox(null);
    load();
  };

  // Group by month
  const groups = new Map<string, Photo[]>();
  for (const p of photos) {
    const k = monthKey(p.taken_at);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(p);
  }
  const groupKeys = Array.from(groups.keys()).sort((a, b) => (a < b ? 1 : -1));

  return (
    <AppLayout title="Photo Gallery" subtitle="Chapter moments, captured together.">
      <div className="px-4 mt-4 flex items-center gap-2">
        <Button onClick={onPick} disabled={uploading} className="bg-[var(--brand)] hover:bg-[var(--brand-deep)]">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading…" : "Upload photos"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onFiles}
        />
        <span className="text-xs text-muted-foreground">HD preserved · any size</span>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-10">Loading…</p>
      ) : photos.length === 0 ? (
        <div className="mx-4 mt-6 border-2 border-dashed border-border rounded-2xl py-12 flex flex-col items-center text-muted-foreground">
          <ImageIcon className="h-10 w-10 mb-2" />
          <p className="text-sm">No photos yet. Be the first to upload.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          {groupKeys.map((k) => {
            const items = groups.get(k)!;
            return (
              <section key={k} className="px-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-extrabold text-[var(--brand)]">{monthLabel(k)}</h3>
                  <button
                    onClick={() => downloadGroup(k, items)}
                    disabled={zipping === k}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-accent)] disabled:opacity-50"
                  >
                    {zipping === k ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                    {zipping === k ? "Zipping…" : `Download all (${items.length})`}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {items.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setLightbox(p)}
                      className="group relative aspect-square overflow-hidden rounded-xl bg-white p-1.5 shadow-md ring-1 ring-black/5 hover:ring-[var(--brand-accent)] hover:shadow-lg transition-all"
                      aria-label="View photo"
                    >
                      <div className="h-full w-full overflow-hidden rounded-md bg-muted">
                        <img
                          src={p.public_url}
                          alt={p.caption ?? "Chapter moment"}
                          loading="lazy"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex flex-col"
          onClick={() => setLightbox(null)}
        >
          <div className="flex items-center justify-between p-3 text-white" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs opacity-80 truncate">
              {new Date(lightbox.taken_at).toLocaleString()}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadOne(lightbox)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm font-semibold"
              >
                <Download className="h-4 w-4" /> Download
              </button>
              {(isAdmin || user?.id === lightbox.uploader_id) && (
                <button
                  onClick={() => deletePhoto(lightbox)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-500/80 hover:bg-red-500 text-sm font-semibold"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              )}
              <button onClick={() => setLightbox(null)} className="p-1.5 rounded-md hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.public_url}
              alt={lightbox.caption ?? "Chapter moment"}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </AppLayout>
  );
}
