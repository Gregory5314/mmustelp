import { createFileRoute } from "@tanstack/react-router";
import { PermissionGate } from "@/components/AppLayout";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Trash2, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/admin/alumni")({
  head: () => ({ meta: [{ title: "Alumni — MMUST ELP" }] }),
  component: () => <PermissionGate perm="alumni.manage" title="Alumni"><Page /></PermissionGate>,
});

type Row = { id: string; full_name: string; graduation_year: number | null; contact: string | null; notes: string | null };
function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState({ full_name: "", graduation_year: "", contact: "", notes: "" });
  const refresh = () => supabase.from("alumni").select("*").order("graduation_year", { ascending: false })
    .then(({ data }) => setRows((data ?? []) as Row[]));
  useEffect(() => { refresh(); }, []);
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("alumni").insert({
      full_name: form.full_name,
      graduation_year: form.graduation_year ? parseInt(form.graduation_year, 10) : null,
      contact: form.contact || null, notes: form.notes || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Alumni added.");
    setForm({ full_name: "", graduation_year: "", contact: "", notes: "" }); refresh();
  };
  return (
    <>
      <Toaster />
      <section className="px-4 mt-4">
        <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <h3 className="text-base font-extrabold text-[var(--brand)] flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Add Alumni</h3>
          <input required placeholder="Full name *" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input type="number" placeholder="Graduation year" value={form.graduation_year} onChange={(e) => setForm({ ...form, graduation_year: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input placeholder="Contact (email/phone)" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <textarea placeholder="Notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <button className="w-full bg-[var(--brand)] text-brand-foreground font-bold py-2.5 rounded-lg">Add</button>
        </form>
      </section>
      <section className="px-4 mt-6 space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-xl p-3 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-bold">{r.full_name}</p>
              <p className="text-xs text-muted-foreground">{r.graduation_year ?? "—"} {r.contact ? `• ${r.contact}` : ""}</p>
            </div>
            <button onClick={async () => { await supabase.from("alumni").delete().eq("id", r.id); refresh(); }} className="p-2 text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </section>
    </>
  );
}
