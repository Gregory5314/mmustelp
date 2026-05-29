import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { profileSchema, loadProfile, saveProfile, defaultProfile, type Profile } from "@/lib/profile-store";
import { ChevronLeft, Save } from "lucide-react";

export const Route = createFileRoute("/profile/edit")({
  head: () => ({
    meta: [
      { title: "Edit Profile — MMUST ELP" },
      { name: "description", content: "Update your personal information." },
    ],
  }),
  component: EditProfile,
});

const fields: { name: keyof Profile; label: string; type?: string; inputMode?: "text" | "email" | "tel" | "numeric" }[] = [
  { name: "fullName", label: "Full Name" },
  { name: "scholarCode", label: "Scholar Code" },
  { name: "course", label: "Course" },
  { name: "phone", label: "Phone Number", type: "tel", inputMode: "tel" },
  { name: "email", label: "Email Address", type: "email", inputMode: "email" },
  { name: "nationalId", label: "National ID", inputMode: "numeric" },
  { name: "mentoringSchool", label: "Mentoring School" },
];

function EditProfile() {
  const navigate = useNavigate();
  const [values, setValues] = useState<Profile>(defaultProfile);
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { setValues(loadProfile()); }, []);

  const update = (k: keyof Profile, v: string) => {
    setValues((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = profileSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof Profile, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Profile;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setSaving(true);
    saveProfile(result.data);
    setTimeout(() => {
      setSaving(false);
      toast.success("Profile updated");
      navigate({ to: "/profile" });
    }, 300);
  };

  return (
    <AppLayout title="Edit Profile" subtitle="Update your personal information.">
      <Toaster position="top-center" />
      <div className="px-4 mt-3">
        <Link to="/profile" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand)]">
          <ChevronLeft className="h-4 w-4" /> Back to profile
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="px-4 mt-3 space-y-3" noValidate>
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm">
          {fields.map((f) => (
            <div key={f.name}>
              <label htmlFor={f.name} className="text-[10px] font-semibold tracking-wider text-muted-foreground">
                {f.label.toUpperCase()}
              </label>
              <input
                id={f.name}
                type={f.type ?? "text"}
                inputMode={f.inputMode}
                value={values[f.name]}
                maxLength={120}
                onChange={(e) => update(f.name, e.target.value)}
                className={`mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand)] ${
                  errors[f.name] ? "border-destructive" : "border-input"
                }`}
                aria-invalid={!!errors[f.name]}
                aria-describedby={errors[f.name] ? `${f.name}-err` : undefined}
              />
              {errors[f.name] && (
                <p id={`${f.name}-err`} className="mt-1 text-xs font-semibold text-destructive">
                  {errors[f.name]}
                </p>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 bg-[var(--brand)] text-brand-foreground font-bold py-3 rounded-lg shadow hover:bg-[var(--brand-deep)] transition-colors disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </AppLayout>
  );
}
