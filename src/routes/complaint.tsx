import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";

export const Route = createFileRoute("/complaint")({
  head: () => ({
    meta: [
      { title: "Report Complaint — MMUST ELP" },
      { name: "description", content: "Submit a complaint or concern to chapter officials." },
    ],
  }),
  component: Complaint,
});

function Complaint() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <AppLayout title="Report Complaint" subtitle="Your voice matters.">
      <section className="px-4 mt-4">
        {submitted ? (
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <p className="text-base font-extrabold text-[var(--brand)]">Thank you.</p>
            <p className="text-sm text-muted-foreground mt-1">Your complaint has been received.</p>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
            className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm"
          >
            <div>
              <label className="text-xs font-semibold tracking-wider text-muted-foreground">SUBJECT</label>
              <input required className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Brief subject" />
            </div>
            <div>
              <label className="text-xs font-semibold tracking-wider text-muted-foreground">CATEGORY</label>
              <select className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option>Financial</option>
                <option>Leadership</option>
                <option>Events</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold tracking-wider text-muted-foreground">DETAILS</label>
              <textarea required rows={5} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Describe your complaint..." />
            </div>
            <button type="submit" className="w-full bg-[var(--brand)] text-brand-foreground font-bold py-3 rounded-lg shadow hover:bg-[var(--brand-deep)] transition-colors">
              Submit Complaint
            </button>
          </form>
        )}
      </section>
    </AppLayout>
  );
}
