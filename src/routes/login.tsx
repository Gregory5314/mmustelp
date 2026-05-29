import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { scholarCodeToEmail } from "@/lib/scholar";
import { bootstrapFirstAdmin } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import logo from "@/assets/elp-logo.png";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — MMUST ELP" },
      { name: "description", content: "Members sign in with their scholar code." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const bootstrap = useServerFn(bootstrapFirstAdmin);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [bootstrapNote, setBootstrapNote] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) navigate({ to: "/", replace: true });
  }, [user, isLoading, navigate]);

  // Ensure first admin exists so an empty deployment is usable.
  useEffect(() => {
    bootstrap()
      .then((r) => {
        if (r.created && "tempPassword" in r) {
          setBootstrapNote(
            `First admin created. Scholar code: ${r.scholarCode}  •  Temp password: ${r.tempPassword}`,
          );
        }
      })
      .catch(() => {});
  }, [bootstrap]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const email = scholarCodeToEmail(code);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      setError("Invalid scholar code or password.");
      return;
    }
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="MMUST ELP" width={72} height={72} className="h-18 w-18 rounded-full bg-white p-1 object-contain shadow" />
          <h1 className="mt-3 text-2xl font-extrabold text-[var(--brand)]">MMUST ELP</h1>
          <p className="text-sm text-muted-foreground">Sign in to your member account</p>
        </div>

        <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold tracking-wider text-muted-foreground" htmlFor="code">
              SCHOLAR CODE
            </label>
            <input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. 2018/050/14879"
              autoComplete="username"
              required
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            />
          </div>
          <div>
            <label className="text-xs font-bold tracking-wider text-muted-foreground" htmlFor="password">
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            />
          </div>
          {error && <p className="text-sm text-destructive font-semibold">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[var(--brand)] text-brand-foreground font-bold py-2.5 rounded-lg shadow hover:bg-[var(--brand-deep)] transition-colors disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>
          {bootstrapNote && (
            <p className="text-[11px] text-muted-foreground bg-accent/60 rounded-md p-2 leading-snug">
              {bootstrapNote} — change it from the admin page after signing in.
            </p>
          )}
          <p className="text-[11px] text-muted-foreground text-center">
            Don't have an account? Ask a chapter admin to create one for you.
          </p>
        </form>
      </div>
    </div>
  );
}
