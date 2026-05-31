import { createFileRoute } from "@tanstack/react-router";
import { PermissionGate } from "@/components/AppLayout";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin/events")({
  head: () => ({ meta: [{ title: "Manage Events — MMUST ELP" }] }),
  component: () => <PermissionGate perm="events.update" title="Manage Events"><Page /></PermissionGate>,
});

type Ev = { id: string; title: string; description: string | null; starts_at: string; location: string | null; status: string };

function Page() {
  const [items, setItems] = useState<Ev[]>([]);
  const [form, setForm] = useState({ title: "", description: "", starts_at: "", location: "" });
  const [busy, setBusy] = useState(false);

  const refresh = () => supabase.from("events").select("*").order("starts_at", { ascending: false })
    .then(({ data }) => setItems((data ?? []) as Ev[]));
  useEffect(() => { refresh(); }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.from("events").insert({
      title: form.title, description: form.description || null,
      starts_at: new Date(form.starts_at).toISOString(),
      location: form.location || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Event created. Members notified.");
    setForm({ title: "", description: "", starts_at: "", location: "" });
    refresh();
  };

  const markSuccessful = async (id: string) => {
    const { error } = await supabase.from("events").update({ status: "successful" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Marked as successful."); refresh();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Event removed."); refresh();
  };

  return (
    <>
      <Toaster />
      <section className="px-4 mt-4">
        <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="text-base font-extrabold text-[var(--brand)] flex items-center gap-2">
            <Calendar className="h-5 w-5" /> New Event
          </h3>
          <Input label="Title *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
          <Input label="Date & Time *" type="datetime-local" value={form.starts_at} onChange={(v) => setForm({ ...form, starts_at: v })} required />
          <Input label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
          <TextArea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
          <button type="submit" disabled={busy} className="w-full bg-[var(--brand)] text-brand-foreground font-bold py-2.5 rounded-lg disabled:opacity-60">
            {busy ? "Creating…" : "Create Event"}
          </button>
        </form>
      </section>

      <section className="px-4 mt-6 space-y-2">
        <h3 className="text-base font-extrabold text-[var(--brand)]">All Events ({items.length})</h3>
        {items.map((ev) => (
          <div key={ev.id} className="bg-card border border-border rounded-xl p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm font-bold">{ev.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(ev.starts_at).toLocaleString()}{ev.location ? ` • ${ev.location}` : ""}</p>
                <span className={`mt-1 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${ev.status === "successful" ? "bg-green-100 text-green-700" : "bg-[var(--brand)]/10 text-[var(--brand)]"}`}>{ev.status}</span>
              </div>
              <div className="flex flex-col gap-1">
                {ev.status !== "successful" && (
                  <button onClick={() => markSuccessful(ev.id)} className="p-2 text-green-600 hover:bg-green-50 rounded" title="Mark successful">
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => remove(ev.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

function Input({ label, value, onChange, required, type = "text" }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string }) {
  return (
    <div>
      <label className="text-[10px] font-bold tracking-wider text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
    </div>
  );
}
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] font-bold tracking-wider text-muted-foreground">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
    </div>
  );
}
