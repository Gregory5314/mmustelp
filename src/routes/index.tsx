import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { BarChart3, Users, CalendarDays, TrendingUp } from "lucide-react";

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

function Dashboard() {
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
