import { createFileRoute } from "@tanstack/react-router";
import { PermissionGate } from "@/components/AppLayout";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Award, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin/recognition")({
  head: () => ({ meta: [{ title: "Scholar Recognition — MMUST ELP" }] }),
  component: () => (
    <PermissionGate perm="recognition.manage" title="Scholar of the Month">
      <Page />
    </PermissionGate>
  ),
});

type R = {
  id: string;
  scholar_name: string;
  recognition_type: string;
  description: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
};

function Page() {
  const [items, setItems] = useState<R[]>([]);
  const [form, setForm] = useState({
    scholar_name: "",
    recognition_type: "Scholar of the Month",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = () =>
    supabase
      .from("scholar_recognition")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as R[]));
  useEffect(() => {
    refresh();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    let photo_url: string | null = null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setBusy(false);
        return toast.error("Image must be under 5MB");
      }
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `recognition/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) {
        setBusy(false);
        return toast.error(upErr.message);
      }
      photo_url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    }
    await supabase.from("scholar_recognition").update({ is_active: false }).eq("is_active", true);
    const { error } = await supabase.from("scholar_recognition").insert({
      scholar_name: form.scholar_name,
      recognition_type: form.recognition_type,
      description: form.description || null,
      photo_url,
      is_active: true,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Recognition published.");
    setForm({ scholar_name: "", recognition_type: "Scholar of the Month", description: "" });
    setFile(null);
    refresh();
  };

  const setActive = async (id: string) => {
    await supabase.from("scholar_recognition").update({ is_active: false }).eq("is_active", true);
    const { error } = await supabase.from("scholar_recognition").update({ is_active: true }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Active recognition updated.");
    refresh();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("scholar_recognition").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed.");
    refresh();
  };

  return (
    <>
      <Toaster />
      <section className="px-4 mt-4">
        <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="text-base font-extrabold text-[var(--brand)] flex items-center gap-2">
            <Award className="h-5 w-5" /> Recognize a Scholar
          </h3>
          <input
            required
            placeholder="Scholar name"
            value={form.scholar_name}
            onChange={(e) => setForm({ ...form, scholar_name: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            placeholder="Recognition type"
            value={form.recognition_type}
            onChange={(e) => setForm({ ...form, recognition_type: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Why are they being recognized?"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          <div>
            <label className="text-[10px] font-bold tracking-wider text-muted-foreground">Scholar photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[var(--brand)] text-brand-foreground font-bold py-2.5 rounded-lg disabled:opacity-60"
          >
            {busy ? "Publishing…" : "Publish Recognition"}
          </button>
        </form>
      </section>

      <section className="px-4 mt-6 space-y-2 pb-4">
        <h3 className="text-base font-extrabold text-[var(--brand)]">All Recognitions ({items.length})</h3>
        {items.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-xl p-3 flex items-start gap-3">
            {r.photo_url ? (
              <img src={r.photo_url} alt={r.scholar_name} className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-muted" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">
                {r.scholar_name}
                {r.is_active && (
                  <span className="ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-green-100 text-green-700">
                    Active
                  </span>
                )}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-[var(--brand-accent)] font-bold">
                {r.recognition_type}
              </p>
              {r.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-3">{r.description}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              {!r.is_active && (
                <button onClick={() => setActive(r.id)} className="p-2 text-amber-500 hover:bg-amber-50 rounded" title="Set active">
                  <Star className="h-4 w-4" />
                </button>
              )}
              <button onClick={() => remove(r.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
