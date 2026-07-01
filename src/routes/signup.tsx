import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/elp-logo.png";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — MMUST ELP" },
      { name: "description", content: "Create your MMUST ELP member account." },
    ],
  }),
  component: SignupPage,
});

const schema = z.object({
  fullName: z.string().trim().min(3, "Enter your full official names").max(120),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid mobile number")
    .max(20)
    .regex(/^[0-9 +\-()]+$/, "Digits only"),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(160),
  course: z.string().trim().min(2, "Enter your course").max(120),
  year: z.coerce.number().int().min(1, "Year 1–7").max(7, "Year 1–7"),
  password: z.string().min(8, "At least 8 characters").max(72),
});

function SignupPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    course: "",
    year: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) navigate({ to: "/", replace: true });
  }, [user, isLoading, navigate]);

  const set = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    const data = parsed.data;

    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: data.fullName,
          phone: data.phone,
          contact_email: data.email,
          course: data.course,
          year: String(data.year),
          scholar_code: data.email,
        },
      },
    });
    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }
    setInfo("Account created. Check your email to confirm, then sign in.");
    setTimeout(() => navigate({ to: "/login", replace: true }), 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img
            src={logo}
            alt="MMUST ELP"
            width={72}
            height={72}
            className="h-18 w-18 rounded-full bg-white p-1 object-contain shadow"
          />
          <h1 className="mt-3 text-2xl font-extrabold text-[var(--brand)]">Join MMUST ELP</h1>
          <p className="text-sm text-muted-foreground">Create your member account</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4"
        >
          <Field
            id="fullName"
            label="FULL OFFICIAL NAMES"
            value={form.fullName}
            onChange={(v) => set("fullName", v)}
            placeholder="e.g. Jane Achieng Otieno"
            autoComplete="name"
          />
          <Field
            id="phone"
            label="MOBILE NUMBER"
            type="tel"
            value={form.phone}
            onChange={(v) => set("phone", v)}
            placeholder="+254 7XX XXX XXX"
            autoComplete="tel"
          />
          <Field
            id="email"
            label="EMAIL ADDRESS"
            type="email"
            value={form.email}
            onChange={(v) => set("email", v)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Field
            id="course"
            label="COURSE OF STUDY"
            value={form.course}
            onChange={(v) => set("course", v)}
            placeholder="e.g. B.Sc. Electrical Engineering"
          />
          <div>
            <label
              className="text-xs font-bold tracking-wider text-muted-foreground"
              htmlFor="year"
            >
              YEAR OF STUDY
            </label>
            <select
              id="year"
              value={form.year}
              onChange={(e) => set("year", e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            >
              <option value="">Select year</option>
              {[1, 2, 3, 4, 5, 6].map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>
          <Field
            id="password"
            label="PASSWORD"
            type="password"
            value={form.password}
            onChange={(v) => set("password", v)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />

          {error && <p className="text-sm text-destructive font-semibold">{error}</p>}
          {info && (
            <p className="text-sm text-[var(--brand)] font-semibold bg-accent/60 rounded-md p-2">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[var(--brand)] text-brand-foreground font-bold py-2.5 rounded-lg shadow hover:bg-[var(--brand-deep)] transition-colors disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Create Account"}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            Already a member?{" "}
            <Link to="/login" className="text-[var(--brand)] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold tracking-wider text-muted-foreground" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
      />
    </div>
  );
}
