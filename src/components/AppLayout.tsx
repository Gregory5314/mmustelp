import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Menu, X, Home, User, CheckSquare, BarChart3, Users, Shield,
  AlertTriangle, Link2, Bell, MoreHorizontal,
} from "lucide-react";
import logo from "@/assets/elp-logo.png";

const menuItems = [
  { icon: Home, label: "Dashboard", to: "/" as const },
  { icon: User, label: "My Profile", to: "/profile" as const },
  { icon: CheckSquare, label: "Chapter Activities", to: "/activities" as const },
  { icon: BarChart3, label: "Finance Overview", to: "/finance" as const },
  { icon: Users, label: "Members List", to: "/members" as const },
  { icon: Shield, label: "Chapter Officials", to: "/officials" as const },
  { icon: AlertTriangle, label: "Report Complaint", to: "/complaint" as const },
];

const bottomNav = [
  { icon: Home, label: "Dashboard", to: "/" as const },
  { icon: Link2, label: "Links", to: "/links" as const },
  { icon: Bell, label: "Notify", to: "/notifications" as const, badge: true },
  { icon: MoreHorizontal, label: "More", to: "/more" as const },
];

export function AppLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
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
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-center text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>

      <main>{children}</main>

      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setMenuOpen(false)} />
          <aside className="fixed top-0 left-0 bottom-0 w-72 bg-[var(--brand-deep)] text-brand-foreground z-50 p-2 rounded-r-2xl shadow-2xl animate-in slide-in-from-left">
            <nav className="mt-2">
              {menuItems.map(({ icon: Icon, label, to }) => (
                <button
                  key={label}
                  onClick={() => { setMenuOpen(false); navigate({ to }); }}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-lg hover:bg-white/10 transition-colors text-left"
                >
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

      <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.04)] z-30">
        <div className="grid grid-cols-4 max-w-md mx-auto">
          {bottomNav.map(({ icon: Icon, label, to, badge }) => (
            <Link
              key={label}
              to={to}
              activeOptions={{ exact: true }}
              className="flex flex-col items-center justify-center py-2.5 gap-1 group"
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`h-6 w-6 ${isActive ? "text-[var(--brand-accent)]" : "text-[var(--brand)]"}`} />
                    {badge && <span className="absolute -top-1 -right-1.5 h-3.5 w-3.5 rounded-full bg-[var(--brand-accent)] text-white text-[9px] font-bold flex items-center justify-center">!</span>}
                  </div>
                  <span className={`text-xs font-semibold ${isActive ? "text-[var(--brand-accent)]" : "text-foreground"}`}>{label}</span>
                </>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
