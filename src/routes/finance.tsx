import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [
      { title: "Finance Overview — MMUST ELP" },
      { name: "description", content: "Chapter financial reports." },
    ],
  }),
  component: Finance,
});

type Report = {
  id: string;
  title: string;
  period: string | null;
  notes: string | null;
  file_url: string | null;
  created_at: string;
};

function Finance() {
  const [items, setItems] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Public read — non-sensitive columns only (omit uploaded_by)
    supabase
      .from("financial_reports")
      .select("id,title,period,notes,file_url,created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems((data ?? []) as Report[]);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <header className="px-4 pt-6 pb-4 bg-[var(--brand)] text-brand-foreground">
        <h1 className="text-2xl font-extrabold">Finance Overview</h1>
        <p className="text-sm opacity-90">Published financial reports.</p>
      </header>

      <section className="px-4 mt-5 pb-6 space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No financial reports published yet.</p>
        ) : (
          items.map((r) => (
            <article key={r.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-[var(--brand)]/10 text-[var(--brand)] flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-extrabold text-[var(--brand)]">{r.title}</h3>
                  {r.period && <p className="text-xs text-muted-foreground mt-0.5">{r.period}</p>}
                  {r.notes && <p className="text-sm text-foreground mt-2">{r.notes}</p>}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                    <CalendarDays className="h-3.5 w-3.5" /> {new Date(r.created_at).toLocaleDateString()}
                  </div>
                  {r.file_url && (
                    <a href={r.file_url} target="_blank" rel="noreferrer"
                      className="mt-3 inline-block text-xs font-bold text-[var(--brand-accent)] underline">
                      View report
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
