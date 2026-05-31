import { createFileRoute } from "@tanstack/react-router";
import { PermissionGate } from "@/components/AppLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin/subscriptions")({
  head: () => ({ meta: [{ title: "Subscriptions — MMUST ELP" }] }),
  component: () => <PermissionGate perm="subscriptions.update" title="Subscriptions"><Page /></PermissionGate>,
});

type Row = { id: string; full_name: string; scholar_code: string; status: string };
function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const refresh = async () => {
    const { data: profs } = await supabase.from("profiles").select("id, full_name, scholar_code").order("full_name");
    const { data: subs } = await supabase.from("subscriptions").select("profile_id, status");
    const statusMap = new Map((subs ?? []).map((s) => [s.profile_id, s.status]));
    setRows((profs ?? []).map((p) => ({ ...p, status: statusMap.get(p.id) ?? "inactive" })));
  };
  useEffect(() => { refresh(); }, []);
  const toggle = async (id: string, current: string) => {
    const next = current === "active" ? "inactive" : "active";
    const { error } = await supabase.from("subscriptions").upsert({ profile_id: id, status: next, updated_at: new Date().toISOString() }, { onConflict: "profile_id" });
    if (error) return toast.error(error.message);
    toast.success(`Set to ${next}`); refresh();
  };
  return (
    <>
      <Toaster />
      <section className="px-4 mt-4 space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{r.full_name || "—"}</p>
              <p className="text-xs text-muted-foreground">{r.scholar_code}</p>
            </div>
            <button onClick={() => toggle(r.id, r.status)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full ${r.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
              {r.status}
            </button>
          </div>
        ))}
      </section>
    </>
  );
}
