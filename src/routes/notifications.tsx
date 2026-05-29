import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — MMUST ELP" }, { name: "description", content: "Chapter notifications." }] }),
  component: Notifications,
});

const items = [
  { title: "Leadership Workshop reminder", time: "2h ago", unread: true },
  { title: "New member joined the chapter", time: "Yesterday", unread: true },
  { title: "Treasurer posted finance update", time: "2 days ago" },
  { title: "Welcome to MMUST ELP", time: "Last week" },
];

function Notifications() {
  return (
    <AppLayout title="Notifications" subtitle="Stay up to date.">
      <section className="px-4 mt-4 space-y-2">
        {items.map((n, i) => (
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
