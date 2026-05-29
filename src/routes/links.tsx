import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/links")({
  head: () => ({ meta: [{ title: "Links — MMUST ELP" }, { name: "description", content: "Useful links and resources." }] }),
  component: Links,
});

const links = [
  { label: "MMUST Official Site", href: "https://www.mmust.ac.ke" },
  { label: "Equity Group Foundation", href: "https://equitygroupfoundation.com" },
  { label: "Chapter Activities", to: "/activities" as const },
  { label: "Members List", to: "/members" as const },
  { label: "Chapter Officials", to: "/officials" as const },
];

function Links() {
  return (
    <AppLayout title="Links" subtitle="Quick access to chapter resources.">
      <section className="px-4 mt-4 space-y-2">
        {links.map((l) =>
          "href" in l ? (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer"
               className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3 font-semibold text-foreground hover:bg-accent transition-colors">
              {l.label} <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          ) : (
            <Link key={l.label} to={l.to}
               className="block bg-card border border-border rounded-xl px-4 py-3 font-semibold text-foreground hover:bg-accent transition-colors">
              {l.label}
            </Link>
          )
        )}
      </section>
    </AppLayout>
  );
}
