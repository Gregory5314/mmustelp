import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { CalendarDays, MapPin } from "lucide-react";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "Chapter Activities — MMUST ELP" },
      { name: "description", content: "Upcoming and past chapter activities." },
    ],
  }),
  component: Activities,
});

const activities = [
  { name: "Leadership Workshop", date: "March 25, 2026", place: "MMUST Main Hall", status: "Upcoming" },
  { name: "Career Mentorship Session", date: "February 10, 2026", place: "Resource Center", status: "Upcoming" },
  { name: "Chapter Annual Meeting", date: "January 19, 2026", place: "Auditorium B", status: "Past" },
  { name: "Community Outreach", date: "December 12, 2025", place: "St. Luke's High", status: "Past" },
];

function Activities() {
  return (
    <AppLayout title="Chapter Activities" subtitle="Workshops, mentorship, and outreach.">
      <section className="px-4 mt-4 space-y-3">
        {activities.map((a) => (
          <div key={a.name} className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-extrabold text-[var(--brand)]">{a.name}</h3>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                a.status === "Upcoming"
                  ? "bg-[var(--brand-accent)]/10 text-[var(--brand-accent)]"
                  : "bg-muted text-muted-foreground"
              }`}>{a.status}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
              <CalendarDays className="h-4 w-4" /> {a.date}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" /> {a.place}
            </div>
          </div>
        ))}
      </section>
    </AppLayout>
  );
}
