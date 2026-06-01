import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { BarChart3, Users, CalendarDays, TrendingUp, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — MMUST ELP" },
      { name: "description", content: "MMUST ELP chapter dashboard and key stats." },
    ],
  }),
  component: Dashboard,
});

const stats = [
  { icon: Users, label: "Members", value: "82", to: "/members" as const },
  { icon: TrendingUp, label: "Finance", value: "KSh 52,300", to: "/finance" as const },
  { icon: CalendarDays, label: "Events", value: "3", to: "/activities" as const },
  { icon: BarChart3, label: "Growth", value: "+12%", to: "/finance" as const },
];

type Ev = {
  id: string; title: string; starts_at: string;
  location: string | null; photo_url: string | null;
};

function Dashboard() {
  const [upcoming, setUpcoming] = useState<Ev[]>([]);

  useEffect(() => {
    const nowIso = new Date().toISOString();
    supabase
      .from("events")
      .select("id,title,starts_at,location,photo_url")
      .gte("starts_at", nowIso)
      .order("starts_at", { ascending: true })
      .limit(5)
      .then(({ data }) => setUpcoming((data ?? []) as Ev[]));
  }, []);

  return (
    <AppLayout title="Dashboard" subtitle="Welcome back to your chapter.">
      <section className="px-4 mt-4 grid grid-cols-2 gap-3">
        {stats.map(({ icon: Icon, label, value, to }) => (
          <Link
            key={label}
            to={to}
            className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <Icon className="h-6 w-6 text-[var(--brand-accent)]" />
            <p className="text-xs font-semibold tracking-wider text-muted-foreground mt-3">{label}</p>
            <p className="text-xl font-extrabold text-[var(--brand)] leading-tight">{value}</p>
          </Link>
        ))}
      </section>

      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-base font-extrabold text-[var(--brand)]">Upcoming Events</h4>
          <Link to="/activities" className="text-xs font-bold text-[var(--brand-accent)]">See all</Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-4 text-sm text-muted-foreground">
            No upcoming events scheduled.
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((ev) => (
              <article key={ev.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-[16/9] bg-muted">
                  {ev.photo_url ? (
                    <img src={ev.photo_url} alt={ev.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[var(--brand)] to-[var(--brand-accent)] text-brand-foreground font-extrabold">
                      Upcoming Event
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-extrabold text-[var(--brand)]">{ev.title}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <CalendarDays className="h-3.5 w-3.5" /> {new Date(ev.starts_at).toLocaleString()}
                  </div>
                  {ev.location && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="h-3.5 w-3.5" /> {ev.location}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="px-4 mt-6 mb-6">
        <h4 className="text-base font-extrabold text-[var(--brand)] mb-2">Quick Actions</h4>
        <div className="space-y-2">
          <Link to="/profile" className="block bg-card border border-border rounded-xl px-4 py-3 font-semibold text-foreground hover:bg-accent transition-colors">
            View My Profile
          </Link>
          <Link to="/activities" className="block bg-card border border-border rounded-xl px-4 py-3 font-semibold text-foreground hover:bg-accent transition-colors">
            Chapter Activities
          </Link>
          <Link to="/officials" className="block bg-card border border-border rounded-xl px-4 py-3 font-semibold text-foreground hover:bg-accent transition-colors">
            Chapter Officials
          </Link>
        </div>
      </section>
    </AppLayout>
  );
}
