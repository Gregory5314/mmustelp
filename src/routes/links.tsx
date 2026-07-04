import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { ExternalLink, Upload, Loader2, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/links")({
  head: () => ({ meta: [{ title: "Links — MMUST ELP" }, { name: "description", content: "Useful links and resources." }] }),
  component: Links,
});

type LinkItem = {
  key: string;
  label: string;
  href?: string;
  to?: "/activities" | "/members" | "/officials";
  fallback: string; // gradient fallback color pair
};

const links: LinkItem[] = [
  { key: "equity_taleo", label: "Equity Taleo Careers", href: "https://equitybank.taleo.net/careersection/ext_new/jobsearch.ftl", fallback: "from-red-600 to-rose-800" },
  { key: "equity_group_foundation", label: "Equity Group Foundation", href: "https://equitygroupfoundation.com", fallback: "from-red-700 to-orange-700" },
  { key: "equity_afya", label: "Equity Afya Careers", href: "https://equityafya.co.ke/careers/", fallback: "from-emerald-700 to-teal-800" },
  { key: "mmust_site", label: "MMUST Official Site", href: "https://www.mmust.ac.ke", fallback: "from-blue-700 to-indigo-800" },
  { key: "activities", label: "Chapter Activities", to: "/activities", fallback: "from-amber-600 to-orange-700" },
  { key: "members", label: "Members List", to: "/members", fallback: "from-purple-700 to-fuchsia-800" },
  { key: "officials", label: "Chapter Officials", to: "/officials", fallback: "from-slate-700 to-slate-900" },
];

const BUCKET = "event_photos";

function Links() {
  const { isAdmin } = useAuth();
  const [images, setImages] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = async () => {
    const { data } = await (supabase as any).from("link_images").select("link_key,image_url");
    const map: Record<string, string> = {};
    (data ?? []).forEach((r: any) => { map[r.link_key] = r.image_url; });
    setImages(map);
  };

  useEffect(() => { load(); }, []);

  const pick = (key: string) => fileRefs.current[key]?.click();

  const onFile = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Please choose an image"); return; }
    setUploading(key);
    try {
      const ext = f.name.split(".").pop() || "jpg";
      const path = `links/${key}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, f, {
        cacheControl: "31536000", upsert: true, contentType: f.type,
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const { error: dbErr } = await (supabase as any)
        .from("link_images")
        .upsert({ link_key: key, image_url: pub.publicUrl, storage_path: path }, { onConflict: "link_key" });
      if (dbErr) throw dbErr;
      toast.success("Background updated");
      setImages((m) => ({ ...m, [key]: pub.publicUrl }));
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const renderCard = (l: LinkItem) => {
    const bg = images[l.key];
    const inner = (
      <>
        {bg ? (
          <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${l.fallback}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="relative h-full w-full p-4 flex flex-col justify-between">
          <div className="flex justify-end">
            {"href" in l && l.href ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-white/90 bg-white/15 backdrop-blur px-2 py-0.5 rounded-full">
                External <ExternalLink className="h-3 w-3" />
              </span>
            ) : null}
          </div>
          <div>
            <h3 className="text-white font-extrabold text-lg leading-tight drop-shadow">
              {l.label}
            </h3>
          </div>
        </div>
      </>
    );

    return (
      <div key={l.key} className="relative">
        <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-white p-1.5 shadow-md ring-1 ring-black/5 hover:ring-[var(--brand-accent)] hover:shadow-lg transition-all">
          {l.href ? (
            <a href={l.href} target="_blank" rel="noreferrer" className="relative block h-full w-full overflow-hidden rounded-xl">
              {inner}
            </a>
          ) : (
            <Link to={l.to!} className="relative block h-full w-full overflow-hidden rounded-xl">
              {inner}
            </Link>
          )}
        </div>
        {isAdmin && (
          <>
            <button
              onClick={() => pick(l.key)}
              disabled={uploading === l.key}
              className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 hover:bg-black/80 text-white text-[11px] font-semibold backdrop-blur"
              aria-label="Change background photo"
            >
              {uploading === l.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (bg ? <Upload className="h-3.5 w-3.5" /> : <ImagePlus className="h-3.5 w-3.5" />)}
              {uploading === l.key ? "Uploading" : bg ? "Change" : "Add photo"}
            </button>
            <input
              ref={(el) => { fileRefs.current[l.key] = el; }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(l.key, e)}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <AppLayout title="Links" subtitle="Quick access to chapter resources.">
      <section className="px-4 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map(renderCard)}
      </section>
      {isAdmin && (
        <p className="px-4 mt-3 text-xs text-muted-foreground">
          Tap "Add photo" / "Change" on any card to set its background. 3:2 images look best.
        </p>
      )}
    </AppLayout>
  );
}
