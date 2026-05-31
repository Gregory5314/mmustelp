import { createFileRoute } from "@tanstack/react-router";
import { PermissionGate } from "@/components/AppLayout";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Trash2, FileText } from "lucide-react";

export const Route = createFileRoute("/admin/meetings")({
  head: () => ({ meta: [{ title: "Meeting Reports — MMUST ELP" }] }),
  component: () => <PermissionGate perm="meetings.upload" title="Meeting Reports"><Page /></PermissionGate>,
});

type Row = { id: string; title: string; meeting_date: string; notes: string | null };
function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState({ title: "", meeting_date: "", notes: "" });
  const refresh = () => supabase.from("meeting_reports").select("*").order("meeting_date", { ascending: false })
    .then(({ data }) => setRows((data ?? []) as Row[]));
  useEffect(() => { refresh(); }, []);
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("meeting_reports").insert({
      title: form.title, meeting_date: form.meeting_date, notes: form.notes || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Meeting report posted.");
    setForm({ title: "", meeting_date: "", notes: "" }); refresh();
  };
  return (
    <>
      <Toaster />
      <section className="px-4 mt-4">
        <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <h3 className="text-base font-extrabold text-[var(--brand)] flex items-center gap-2"><FileText className="h-5 w-5" /> New Report</h3>
          <input required placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input required type="date" value={form.meeting_date} onChange={(e) => setForm({ ...form, meeting_date: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <textarea placeholder="Notes / minutes" rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <button className="w-full bg-[var(--brand)] text-brand-foreground font-bold py-2.5 rounded-lg">Post Report</button>
        </form>
      </section>
      <section className="px-4 mt-6 space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-xl p-3 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-bold">{r.title}</p>
              <p className="text-xs text-muted-foreground">{new Date(r.meeting_date).toLocaleDateString()}</p>
              {r.notes && <p className="text-xs mt-1 whitespace-pre-wrap">{r.notes}</p>}
            </div>
            <button onClick={async () => { await supabase.from("meeting_reports").delete().eq("id", r.id); refresh(); }} className="p-2 text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </section>
    </>
  );
}
