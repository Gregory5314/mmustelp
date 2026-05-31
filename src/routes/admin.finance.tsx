import { createFileRoute } from "@tanstack/react-router";
import { PermissionGate } from "@/components/AppLayout";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Trash2, DollarSign } from "lucide-react";

export const Route = createFileRoute("/admin/finance")({
  head: () => ({ meta: [{ title: "Financial Reports — MMUST ELP" }] }),
  component: () => <PermissionGate perm="finance.upload" title="Financial Reports"><Page /></PermissionGate>,
});

type Row = { id: string; title: string; period: string | null; notes: string | null; created_at: string };
function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState({ title: "", period: "", notes: "" });
  const refresh = () => supabase.from("financial_reports").select("*").order("created_at", { ascending: false })
    .then(({ data }) => setRows((data ?? []) as Row[]));
  useEffect(() => { refresh(); }, []);
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("financial_reports").insert({
      title: form.title, period: form.period || null, notes: form.notes || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Report posted. Members notified.");
    setForm({ title: "", period: "", notes: "" }); refresh();
  };
  return (
    <>
      <Toaster />
      <section className="px-4 mt-4">
        <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <h3 className="text-base font-extrabold text-[var(--brand)] flex items-center gap-2"><DollarSign className="h-5 w-5" /> New Report</h3>
          <input required placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input placeholder="Period (e.g. Jan 2026)" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <textarea placeholder="Notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <button className="w-full bg-[var(--brand)] text-brand-foreground font-bold py-2.5 rounded-lg">Post Report</button>
        </form>
      </section>
      <section className="px-4 mt-6 space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-xl p-3 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-bold">{r.title}</p>
              <p className="text-xs text-muted-foreground">{r.period} • {new Date(r.created_at).toLocaleDateString()}</p>
              {r.notes && <p className="text-xs mt-1">{r.notes}</p>}
            </div>
            <button onClick={async () => { await supabase.from("financial_reports").delete().eq("id", r.id); refresh(); }} className="p-2 text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </section>
    </>
  );
}
