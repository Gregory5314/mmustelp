import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Menu, X, Home, User, CheckSquare, BarChart3, Users, Shield,
  AlertTriangle, Link2, Bell, MoreHorizontal, ChevronRight, CalendarDays,
} from "lucide-react";
import logo from "@/assets/elp-logo.png";
import avatar from "@/assets/member-avatar.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MMUST ELP — Member Profile" },
      { name: "description", content: "Equity Leaders Program member profile and chapter activity." },
    ],
  }),
  component: Index,
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

const menuItems = [
  { icon: Home, label: "Dashboard" },
  { icon: User, label: "My Profile" },
  { icon: CheckSquare, label: "Chapter Activities" },
  { icon: BarChart3, label: "Finance Overview" },
  { icon: Users, label: "Members List" },
  { icon: Shield, label: "Chapter Officials" },
  { icon: AlertTriangle, label: "Report Complaint" },
];

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top brand bar */}
      <header className="bg-[var(--brand)] text-brand-foreground px-4 pt-3 pb-4 rounded-b-2xl shadow-md">
        <div className="flex items-center gap-3">
          <img src={logo} alt="MMUST ELP crest" width={48} height={48}
               className="h-12 w-12 rounded-full bg-white p-0.5 object-contain" />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold leading-tight tracking-tight">MMUST ELP</h1>
            <p className="text-xs opacity-90">Equity Leaders Program</p>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <User className="h-4 w-4" />
            <span>82 Members</span>
          </div>
        </div>
      </header>

      {/* Page title */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="p-1.5 -ml-1.5 rounded-md hover:bg-accent"
          >
            <Menu className="h-6 w-6 text-foreground" />
          </button>
          <h2 className="flex-1 text-center text-2xl font-extrabold text-[var(--brand)] -ml-6">
            Member Profile
          </h2>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-1">
          Explore career opportunities below.
        </p>
      </div>

      {/* Profile card */}
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

      {/* Personal Information */}
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

      {/* Chapter Events */}
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

      {/* Side menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setMenuOpen(false)} />
          <aside className="fixed top-0 left-0 bottom-0 w-72 bg-[var(--brand-deep)] text-brand-foreground z-50 p-2 rounded-r-2xl shadow-2xl animate-in slide-in-from-left">
            <nav className="mt-2">
              {menuItems.map(({ icon: Icon, label }) => (
                <button key={label} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-lg hover:bg-white/10 transition-colors">
                  <Icon className="h-5 w-5" />
                  <span className="font-bold text-base">{label}</span>
                </button>
              ))}
              <div className="border-t border-white/15 my-2" />
              <button onClick={() => setMenuOpen(false)} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-lg hover:bg-white/10 transition-colors">
                <X className="h-5 w-5" />
                <span className="font-bold text-base">Close</span>
              </button>
            </nav>
          </aside>
        </>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.04)] z-30">
        <div className="grid grid-cols-4 max-w-md mx-auto">
          {[
            { icon: Home, label: "Dashboard", active: true },
            { icon: Link2, label: "Links" },
            { icon: Bell, label: "Notify", badge: true },
            { icon: MoreHorizontal, label: "More" },
          ].map(({ icon: Icon, label, active, badge }) => (
            <button key={label} className="flex flex-col items-center justify-center py-2.5 gap-1">
              <div className="relative">
                <Icon className={`h-6 w-6 ${active ? "text-[var(--brand-accent)]" : "text-[var(--brand)]"}`} />
                {badge && <span className="absolute -top-1 -right-1.5 h-3.5 w-3.5 rounded-full bg-[var(--brand-accent)] text-white text-[9px] font-bold flex items-center justify-center">!</span>}
              </div>
              <span className={`text-xs font-semibold ${active ? "text-[var(--brand-accent)]" : "text-foreground"}`}>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
