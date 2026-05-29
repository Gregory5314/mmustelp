import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "Members List — MMUST ELP" },
      { name: "description", content: "Directory of MMUST ELP chapter members." },
    ],
  }),
  component: Members,
});

type Member = { id: string; full_name: string; course: string | null; scholar_code: string };

function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, full_name, course, scholar_code")
      .order("full_name", { ascending: true })
      .then(({ data }) => {
        setMembers((data ?? []) as Member[]);
        setLoading(false);
      });
  }, []);

  return (
    <AppLayout title="Members List" subtitle={`${members.length} active members.`}>
      <section className="px-4 mt-4 space-y-2">
        {loading && <p className="text-sm text-muted-foreground text-center py-6">Loading members…</p>}
        {!loading && members.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No members yet. Ask an admin to add members from "Manage Members".
          </p>
        )}
        {members.map((m) => {
          const initials = (m.full_name || m.scholar_code).split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
          return (
            <div key={m.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[var(--brand)] text-brand-foreground flex items-center justify-center font-extrabold">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{m.full_name || "—"}</p>
                <p className="text-xs text-muted-foreground truncate">{m.course || m.scholar_code}</p>
              </div>
            </div>
          );
        })}
      </section>
    </AppLayout>
  );
}
