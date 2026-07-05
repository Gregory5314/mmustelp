import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { ExternalLink, Upload, Loader2, ImagePlus, Crop as CropIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import Cropper, { type Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/links")({
  head: () => ({ meta: [{ title: "Links — MMUST ELP" }, { name: "description", content: "Useful links and resources." }] }),
  component: Links,
});

type LinkItem = {
  key: string;
  label: string;
  href?: string;
  to?: "/activities" | "/members" | "/officials";
  fallback: string;
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
const ASPECT = 3 / 2;

async function getCroppedBlob(imageSrc: string, crop: Area, mime: string): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = imageSrc;
  });
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(crop.width);
  canvas.height = Math.round(crop.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Crop failed"))), mime, 0.92),
  );
}

function Links() {
  const { isAdmin } = useAuth();
  const [images, setImages] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Cropper state
  const [cropOpen, setCropOpen] = useState(false);
  const [cropKey, setCropKey] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropMime, setCropMime] = useState<string>("image/jpeg");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const load = async () => {
    const { data } = await (supabase as any).from("link_images").select("link_key,image_url");
    const map: Record<string, string> = {};
    (data ?? []).forEach((r: any) => { map[r.link_key] = r.image_url; });
    setImages(map);
  };

  useEffect(() => { load(); }, []);

  const pick = (key: string) => fileRefs.current[key]?.click();

  const onCropComplete = useCallback((_: Area, pixels: Area) => setCroppedArea(pixels), []);

  const onFile = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Please choose an image"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result as string);
      setCropMime(f.type);
      setCropKey(key);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedArea(null);
      setCropOpen(true);
    };
    reader.readAsDataURL(f);
  };

  const confirmCrop = async () => {
    if (!cropKey || !cropSrc || !croppedArea) return;
    setUploading(cropKey);
    setCropOpen(false);
    try {
      const blob = await getCroppedBlob(cropSrc, croppedArea, cropMime);
      const ext = (cropMime.split("/")[1] || "jpg").replace("jpeg", "jpg");
      const path = `links/${cropKey}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, {
        cacheControl: "31536000", upsert: true, contentType: cropMime,
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const { error: dbErr } = await (supabase as any)
        .from("link_images")
        .upsert({ link_key: cropKey, image_url: pub.publicUrl, storage_path: path }, { onConflict: "link_key" });
      if (dbErr) throw dbErr;
      toast.success("Background updated");
      setImages((m) => ({ ...m, [cropKey!]: pub.publicUrl }));
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setUploading(null);
      setCropKey(null);
      setCropSrc(null);
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
          Tap "Add photo" / "Change" on any card to upload and crop the background. Frames use a 3:2 ratio.
        </p>
      )}

      <Dialog open={cropOpen} onOpenChange={(o) => { if (!o) { setCropOpen(false); setCropSrc(null); setCropKey(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CropIcon className="h-4 w-4" /> Crop background (3:2)</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-72 bg-black rounded-md overflow-hidden">
            {cropSrc && (
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={ASPECT}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                objectFit="contain"
              />
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Zoom</label>
            <Slider value={[zoom]} min={1} max={4} step={0.01} onValueChange={(v) => setZoom(v[0])} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCropOpen(false)}>Cancel</Button>
            <Button onClick={confirmCrop} disabled={!croppedArea}>Save background</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
