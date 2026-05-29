import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/officials")({
  head: () => ({
    meta: [
      { title: "Chapter Officials — MMUST ELP" },
      { name: "description", content: "Elected leadership for the MMUST ELP chapter." },
    ],
  }),
  component: Officials,
});

const officials = [
  { role: "Chairperson", name: "Gregory Omar" },
  { role: "Vice Chair", name: "Amina Yusuf" },
  { role: "Secretary", name: "Joy Wanjiru" },
  { role: "Treasurer", name: "Brian Kiprop" },
  { role: "Organizing Secretary", name: "Daniel Mutiso" },
];

function Officials() {
  return (
    <AppLayout title="Chapter Officials" subtitle="Your elected leadership team.">
      <section className="px-4 mt-4 space-y-2">
        {officials.map((o) => (
          <div key={o.role} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
            <Shield className="h-5 w-5 text-[var(--brand-accent)] shrink-0" />
            <div className="flex-1">
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground">{o.role.toUpperCase()}</p>
              <p className="text-sm font-bold text-foreground">{o.name}</p>
            </div>
          </div>
        ))}
      </section>
    </AppLayout>
  );
}
