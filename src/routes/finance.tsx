import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { TrendingUp, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [
      { title: "Finance Overview — MMUST ELP" },
      { name: "description", content: "Chapter finance summary and recent transactions." },
    ],
  }),
  component: Finance,
});

const transactions = [
  { label: "Membership Dues", amount: "+12,500", type: "in" },
  { label: "Workshop Catering", amount: "-4,800", type: "out" },
  { label: "Sponsor Contribution", amount: "+30,000", type: "in" },
  { label: "Transport Reimbursement", amount: "-2,400", type: "out" },
];

function Finance() {
  return (
    <AppLayout title="Finance Overview" subtitle="Track inflows and outflows.">
      <section className="px-4 mt-4">
        <div className="bg-[var(--brand)] text-brand-foreground rounded-2xl p-5 shadow-md">
          <p className="text-xs opacity-80 font-semibold tracking-wider">CURRENT BALANCE</p>
          <p className="text-3xl font-extrabold mt-1">KSh 52,300</p>
          <div className="flex gap-4 mt-3 text-xs">
            <span className="flex items-center gap-1"><TrendingUp className="h-4 w-4" /> +42,500 in</span>
            <span className="flex items-center gap-1"><TrendingDown className="h-4 w-4" /> -7,200 out</span>
          </div>
        </div>
      </section>
      <section className="px-4 mt-6">
        <h4 className="text-base font-extrabold text-[var(--brand)] mb-2">Recent Transactions</h4>
        <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
          {transactions.map((t) => (
            <div key={t.label} className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-semibold text-foreground">{t.label}</p>
              <p className={`text-sm font-extrabold ${t.type === "in" ? "text-[var(--brand)]" : "text-[var(--brand-accent)]"}`}>
                {t.amount}
              </p>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
