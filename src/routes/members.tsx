import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "Members List — MMUST ELP" },
      { name: "description", content: "Directory of MMUST ELP chapter members." },
    ],
  }),
  component: Members,
});

const members = [
  { name: "Gregory Omar", course: "B.Sc. Electrical Eng., Yr 3" },
  { name: "Amina Yusuf", course: "B.Ed. Science, Yr 4" },
  { name: "Brian Kiprop", course: "B.Sc. Computer Science, Yr 2" },
  { name: "Joy Wanjiru", course: "B.Com. Finance, Yr 3" },
  { name: "Daniel Mutiso", course: "B.Sc. Civil Eng., Yr 4" },
  { name: "Faith Akinyi", course: "B.A. Economics, Yr 2" },
];

function Members() {
  return (
    <AppLayout title="Members List" subtitle="82 active members.">
      <section className="px-4 mt-4 space-y-2">
        {members.map((m) => (
          <div key={m.name} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[var(--brand)] text-brand-foreground flex items-center justify-center font-extrabold">
              {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{m.name}</p>
              <p className="text-xs text-muted-foreground truncate">{m.course}</p>
            </div>
          </div>
        ))}
      </section>
    </AppLayout>
  );
}
