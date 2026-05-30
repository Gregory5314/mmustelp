import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, Save, Camera, KeyRound, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/profile/edit")({
  head: () => ({
    meta: [
      { title: "Edit Profile — MMUST ELP" },
      { name: "description", content: "Update your personal information." },
    ],
  }),
  component: EditProfile,
});

type Form = {
  full_name: string;
  course: string;
  phone: string;
  email: string;
  mentoring_school: string;
};

const fields: { key: keyof Form; label: string; type?: string; inputMode?: "text" | "email" | "tel" }[] = [
  { key: "full_name", label: "Full Name" },
  { key: "course", label: "Course" },
  { key: "phone", label: "Phone Number", type: "tel", inputMode: "tel" },
  { key: "email", label: "Email Address", type: "email", inputMode: "email" },
  { key: "mentoring_school", label: "Mentoring School" },
];

function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [values, setValues] = useState<Form>({
    full_name: "", course: "", phone: "", email: "", mentoring_school: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [pw, setPw] = useState({ next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (!data) return;
      setValues({
        full_name: data.full_name ?? "",
        course: data.course ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        mentoring_school: data.mentoring_school ?? "",
      });
      setAvatarUrl(data.avatar_url ?? null);
    });
  }, [user]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(values).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    navigate({ to: "/profile" });
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
      cacheControl: "3600", upsert: true, contentType: file.type,
    });
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = pub.publicUrl;
    const { error: updErr } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    setUploading(false);
    if (updErr) return toast.error(updErr.message);
    setAvatarUrl(url);
    toast.success("Profile picture updated");
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next.length < 6) return toast.error("Password must be at least 6 characters");
    if (pw.next !== pw.confirm) return toast.error("Passwords do not match");
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw.next });
    setPwSaving(false);
    if (error) return toast.error(error.message);
    setPw({ next: "", confirm: "" });
    toast.success("Password changed");
  };

  return (
    <AppLayout title="Edit Profile" subtitle="Update your personal information.">
      <Toaster position="top-center" />
      <div className="px-4 mt-3">
        <Link to="/profile" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand)]">
          <ChevronLeft className="h-4 w-4" /> Back to profile
        </Link>
      </div>

      <section className="px-4 mt-3">
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="h-20 w-20 rounded-xl object-cover" />
          ) : (
            <div className="h-20 w-20 rounded-xl bg-[var(--brand)] text-brand-foreground flex items-center justify-center">
              <UserIcon className="h-8 w-8" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Profile Picture</p>
            <p className="text-xs text-muted-foreground">JPG or PNG, up to 5MB</p>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="mt-2 inline-flex items-center gap-1.5 bg-[var(--brand)] text-brand-foreground text-xs font-bold px-3 py-1.5 rounded-lg shadow disabled:opacity-60">
              <Camera className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Change"}
            </button>
          </div>
        </div>
      </section>

      <form onSubmit={onSave} className="px-4 mt-3 space-y-3" noValidate>
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-[10px] font-semibold tracking-wider text-muted-foreground">{f.label.toUpperCase()}</label>
              <input
                type={f.type ?? "text"}
                inputMode={f.inputMode}
                value={values[f.key]}
                maxLength={160}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
            </div>
          ))}
        </div>
        <button type="submit" disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 bg-[var(--brand)] text-brand-foreground font-bold py-3 rounded-lg shadow hover:bg-[var(--brand-deep)] transition-colors disabled:opacity-60">
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <section className="px-4 mt-6 mb-4">
        <form onSubmit={onChangePassword} className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm">
          <h3 className="text-base font-extrabold text-[var(--brand)] flex items-center gap-2">
            <KeyRound className="h-5 w-5" /> Change Password
          </h3>
          <div>
            <label className="text-[10px] font-semibold tracking-wider text-muted-foreground">NEW PASSWORD</label>
            <input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })}
              minLength={6} required
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-[10px] font-semibold tracking-wider text-muted-foreground">CONFIRM PASSWORD</label>
            <input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              minLength={6} required
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={pwSaving}
            className="w-full bg-[var(--brand)] text-brand-foreground font-bold py-2.5 rounded-lg shadow disabled:opacity-60">
            {pwSaving ? "Updating…" : "Update Password"}
          </button>
        </form>
      </section>
    </AppLayout>
  );
}
