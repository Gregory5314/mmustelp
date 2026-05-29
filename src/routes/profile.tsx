import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { ChevronRight, CalendarDays, Pencil } from "lucide-react";
import avatar from "@/assets/member-avatar.jpg";
import { useEffect, useState } from "react";
import { loadProfile, defaultProfile, type Profile } from "@/lib/profile-store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — MMUST ELP" },
      { name: "description", content: "Member profile and personal information." },
    ],
  }),
  component: ProfilePage,
});

const events = [
  { name: "Leadership Workshop", date: "March 25, 2026" },
  { name: "Career Mentorship Session", date: "February 10, 2026" },
  { name: "Chapter Annual Meeting", date: "January 19, 2026" },
  { name: "Community Outreach", date: "December 12, 2025" },
];

function ProfilePage() {
  const [p, setP] = useState<Profile>(defaultProfile);
  useEffect(() => { setP(loadProfile()); }, []);

  const personal = [
    { label: "SCHOLAR CODE", value: p.scholarCode },
    { label: "COURSE", value: p.course },
    { label: "PHONE NUMBER", value: p.phone },
    { label: "EMAIL ADDRESS", value: p.email },
    { label: "NATIONAL ID", value: p.nationalId },
    { label: "MENTORING SCHOOL", value: p.mentoringSchool },
  ];

  return (
    <AppLayout title="Member Profile" subtitle="Explore career opportunities below.">
      <section className="px-4 mt-4">
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4 flex gap-4 items-center">
          <img src={avatar} alt={p.fullName} width={96} height={96}
               className="h-24 w-24 rounded-xl object-cover" />
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-extrabold text-[var(--brand)] leading-tight">{p.fullName}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{p.scholarCode}</p>
            <Link to="/profile/edit" className="mt-3 inline-flex items-center gap-1.5 bg-[var(--brand)] text-brand-foreground text-sm font-semibold px-4 py-2 rounded-lg shadow hover:bg-[var(--brand-deep)] transition-colors">
              <Pencil className="h-4 w-4" /> Edit Profile <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-base font-extrabold text-[var(--brand)]">Personal Information</h4>
          <Link to="/profile/edit" className="text-xs font-bold text-[var(--brand-accent)]">Edit</Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {personal.map((f) => (
            <div key={f.label} className="bg-card border border-border rounded-lg px-3 py-2.5">
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground">{f.label}</p>
              <p className="text-sm font-bold text-foreground leading-snug mt-0.5 break-words">{f.value}</p>
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
