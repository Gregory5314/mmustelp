import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { ChevronRight, CalendarDays } from "lucide-react";
import avatar from "@/assets/member-avatar.jpg";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — MMUST ELP" },
      { name: "description", content: "Member profile and personal information." },
    ],
  }),
  component: Profile,
});

const personal = [
  { label: "SCHOLAR CODE", value: "011/6857/2019" },
  { label: "COURSE", value: "B.Sc. Electrical Engineering, Year 3" },
  { label: "PHONE NUMBER", value: "254 799 221 5087" },
  { label: "EMAIL ADDRESS", value: "gomar@gmail.com" },
  { label: "NATIONAL ID", value: "30572821" },
  { label: "MENTORING SCHOOL", value: "ST. LUKE'S HIGH SCHOOL" },
];

const events = [
  { name: "Leadership Workshop", date: "March 25, 2026" },
  { name: "Career Mentorship Session", date: "February 10, 2026" },
  { name: "Chapter Annual Meeting", date: "January 19, 2026" },
  { name: "Community Outreach", date: "December 12, 2025" },
];

function Profile() {
  return (
    <AppLayout title="Member Profile" subtitle="Explore career opportunities below.">
      <section className="px-4 mt-4">
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4 flex gap-4 items-center">
          <img src={avatar} alt="Gregory Omar" width={96} height={96}
               className="h-24 w-24 rounded-xl object-cover" />
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-extrabold text-[var(--brand)] leading-tight">Gregory Omar</h3>
            <p className="text-sm text-muted-foreground mt-0.5">011/6857/2019</p>
            <button className="mt-3 inline-flex items-center gap-1.5 bg-[var(--brand)] text-brand-foreground text-sm font-semibold px-4 py-2 rounded-lg shadow hover:bg-[var(--brand-deep)] transition-colors">
              View Profile <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="px-4 mt-6">
        <h4 className="text-base font-extrabold text-[var(--brand)] mb-2">Personal Information</h4>
        <div className="grid grid-cols-2 gap-2.5">
          {personal.map((p) => (
            <div key={p.label} className="bg-card border border-border rounded-lg px-3 py-2.5">
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground">{p.label}</p>
              <p className="text-sm font-bold text-foreground leading-snug mt-0.5">{p.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 mt-6">
        <h4 className="text-base font-extrabold text-[var(--brand)] mb-2">Chapter Events Attended</h4>
        <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
          {events.map((e) => (
            <div key={e.name} className="flex items-center gap-3 px-3 py-3">
              <CalendarDays className="h-5 w-5 text-[var(--brand-accent)] shrink-0" />
              <p className="flex-1 text-sm font-semibold text-foreground truncate">{e.name}</p>
              <p className="text-xs text-muted-foreground whitespace-nowrap">{e.date}</p>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
