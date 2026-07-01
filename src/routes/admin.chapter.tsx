import { createFileRoute } from "@tanstack/react-router";
import { PermissionGate } from "@/components/AppLayout";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { ImagePlus } from "lucide-react";

export const Route = createFileRoute("/admin/chapter")({
  head: () => ({ meta: [{ title: "Chapter Profile — MMUST ELP" }] }),
  component: () => (
    <PermissionGate perm="profile.chapter.edit" title="Chapter Profile">
      <Page />
    </PermissionGate>
  ),
});

function Page() {
  const [id, setId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    motto: "",
    about: "",
    contact_email: "",
    contact_phone: "",
  });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () =>
    supabase.rpc("get_chapter_admin").then(({ data }) => {
      const row = (Array.isArray(data) ? data[0] : data) as null | {
        id: string; logo_url?: string | null; name?: string | null;
        motto?: string | null; about?: string | null;
        contact_email?: string | null; contact_phone?: string | null;
      };
      if (row) {
        setId(row.id);
        setLogoUrl(row.logo_url ?? null);
        setForm({
          name: row.name ?? "",
          motto: row.motto ?? "",
          about: row.about ?? "",
          contact_email: row.contact_email ?? "",
          contact_phone: row.contact_phone ?? "",
        });
      }
    });
  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const { error } = await supabase
      .from("chapter_profile")
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Chapter profile updated.");
  };

  const uploadLogo = async (file: File) => {
    if (!id) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const path = `chapter/logo-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      setUploading(false);
      return toast.error(upErr.message);
    }
    const publicUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    const { error } = await supabase
      .from("chapter_profile")
      .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", id);
    setUploading(false);
    if (error) return toast.error(error.message);
    setLogoUrl(publicUrl);
    toast.success("Chapter logo updated.");
  };

  return (
    <>
      <Toaster />
      <section className="px-4 mt-4">
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-muted overflow-hidden flex items-center justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt="Chapter logo" className="h-full w-full object-contain" />
            ) : (
              <span className="text-[10px] text-muted-foreground">No logo</span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-extrabold text-[var(--brand)]">Chapter Logo</p>
            <p className="text-xs text-muted-foreground mb-2">Upload a new logo (PNG/JPG, max 5MB)</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadLogo(f);
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 bg-[var(--brand)] text-brand-foreground text-xs font-bold px-3 py-2 rounded-lg disabled:opacity-60"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              {uploading ? "Uploading…" : logoUrl ? "Change logo" : "Upload logo"}
            </button>
          </div>
        </div>
      </section>

      <section className="px-4 mt-4 pb-4">
        <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <input
            required
            placeholder="Chapter name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            placeholder="Motto"
            value={form.motto}
            onChange={(e) => setForm({ ...form, motto: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          <textarea
            placeholder="About"
            rows={4}
            value={form.about}
            onChange={(e) => setForm({ ...form, about: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            type="email"
            placeholder="Contact email"
            value={form.contact_email}
            onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            placeholder="Contact phone"
            value={form.contact_phone}
            onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          <button className="w-full bg-[var(--brand)] text-brand-foreground font-bold py-2.5 rounded-lg">
            Save
          </button>
        </form>
      </section>
    </>
  );
}
