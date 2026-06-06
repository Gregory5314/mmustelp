import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Bell, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — MMUST ELP" }] }),
  component: Notifications,
});

type N = { id: string; type: string; title: string; body: string | null; link: string | null; read_at: string | null; created_at: string };

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000); if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60); if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString();
}

function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<N[]>([]);

  const refresh = () => {
    if (!user) return;
    supabase.from("notifications").select("*").eq("recipient_id", user.id)
      .order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => setItems((data ?? []) as N[]));
  };
  useEffect(() => { refresh();
    if (!user) return;
    const topic = `notifications:${user.id}`;
    supabase.getChannels()
      .filter((c) => c.topic === `realtime:${topic}`)
      .forEach((c) => { supabase.removeChannel(c); });
    const ch = supabase.channel(topic, { config: { private: true } })
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `recipient_id=eq.${user.id}` }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  /* eslint-disable-next-line */ }, [user?.id]);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    refresh();
  };
  const markAll = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() })
      .eq("recipient_id", user.id).is("read_at", null);
    refresh();
  };

  const unreadCount = items.filter((i) => !i.read_at).length;

  return (
    <AppLayout title="Notifications" subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}>
      <section className="px-4 mt-4 space-y-2">
        {unreadCount > 0 && (
          <button onClick={markAll} className="text-xs font-bold text-[var(--brand)] ml-auto block">Mark all as read</button>
        )}
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No notifications yet.</p>
        )}
        {items.map((n) => {
          const unread = !n.read_at;
          return (
            <div key={n.id} className={`rounded-xl border px-4 py-3 ${unread ? "bg-[var(--brand-accent)]/5 border-[var(--brand-accent)]/30" : "bg-card border-border"}`}>
              <div className="flex items-start gap-3">
                <Bell className={`h-5 w-5 shrink-0 mt-0.5 ${unread ? "text-[var(--brand-accent)]" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{n.title}</p>
                  {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.created_at)}</p>
                  {unread && (
                    <button onClick={() => markRead(n.id)} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[var(--brand)]">
                      <Check className="h-3.5 w-3.5" /> Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </AppLayout>
  );
}
