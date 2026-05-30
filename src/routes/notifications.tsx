import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Bell, AlertTriangle, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — MMUST ELP" }, { name: "description", content: "Chapter notifications." }] }),
  component: Notifications,
});

type Complaint = {
  id: string;
  subject: string;
  category: string;
  details: string;
  status: string;
  read_at: string | null;
  created_at: string;
  submitter_id: string;
};

type SubmitterMap = Record<string, { full_name: string; scholar_code: string }>;

const staticItems = [
  { title: "Leadership Workshop reminder", time: "2h ago", unread: true },
  { title: "New member joined the chapter", time: "Yesterday", unread: true },
  { title: "Welcome to MMUST ELP", time: "Last week" },
];

function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString();
}

function Notifications() {
  const { isAdmin } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [submitters, setSubmitters] = useState<SubmitterMap>({});

  const refresh = () => {
    supabase.from("complaints").select("*").order("created_at", { ascending: false })
      .then(async ({ data }) => {
        const rows = (data ?? []) as Complaint[];
        setComplaints(rows);
        if (isAdmin && rows.length) {
          const ids = Array.from(new Set(rows.map((r) => r.submitter_id)));
          const { data: profs } = await supabase
            .from("profiles").select("id, full_name, scholar_code").in("id", ids);
          const map: SubmitterMap = {};
          (profs ?? []).forEach((p: any) => { map[p.id] = { full_name: p.full_name, scholar_code: p.scholar_code }; });
          setSubmitters(map);
        }
      });
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [isAdmin]);

  const markRead = async (id: string) => {
    await supabase.from("complaints").update({ read_at: new Date().toISOString(), status: "read" }).eq("id", id);
    refresh();
  };

  return (
    <AppLayout title="Notifications" subtitle={isAdmin ? "Including member complaints." : "Stay up to date."}>
      <section className="px-4 mt-4 space-y-2">
        {isAdmin && complaints.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">No complaints yet.</p>
        )}

        {isAdmin && complaints.map((c) => {
          const unread = !c.read_at;
          const who = submitters[c.submitter_id];
          return (
            <div key={c.id} className={`rounded-xl border px-4 py-3 ${unread ? "bg-destructive/5 border-destructive/30" : "bg-card border-border"}`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${unread ? "text-destructive" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground">{c.subject}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--brand)]/10 text-[var(--brand)]">{c.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {who ? `${who.full_name} • ${who.scholar_code}` : "Member"} · {timeAgo(c.created_at)}
                  </p>
                  <p className="text-sm text-foreground mt-2 whitespace-pre-wrap">{c.details}</p>
                  {unread && (
                    <button onClick={() => markRead(c.id)} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[var(--brand)]">
                      <Check className="h-3.5 w-3.5" /> Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {staticItems.map((n, i) => (
          <div key={i} className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${n.unread ? "bg-[var(--brand-accent)]/5 border-[var(--brand-accent)]/30" : "bg-card border-border"}`}>
            <Bell className={`h-5 w-5 shrink-0 mt-0.5 ${n.unread ? "text-[var(--brand-accent)]" : "text-muted-foreground"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">{n.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
            </div>
            {n.unread && <span className="h-2 w-2 rounded-full bg-[var(--brand-accent)] mt-2" />}
          </div>
        ))}
      </section>
    </AppLayout>
  );
}
