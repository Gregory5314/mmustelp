import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createMember } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";

export const Route = createFileRoute("/admin/members")({
  head: () => ({ meta: [{ title: "Manage Members — MMUST ELP" }] }),
  component: AdminMembers,
});

type Row = { id: string; full_name: string; scholar_code: string; course: string | null };

function AdminMembers() {
  const { isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const create = useServerFn(createMember);

  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState({
    scholarCode: "", password: "", fullName: "",
    email: "", phone: "", course: "", mentoringSchool: "", makeAdmin: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) navigate({ to: "/", replace: true });
  }, [isAdmin, isLoading, navigate]);

  const refresh = () => {
    supabase
      .from("profiles")
      .select("id, full_name, scholar_code, course")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data ?? []) as Row[]));
  };
  useEffect(() => { if (isAdmin) refresh(); }, [isAdmin]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null); setSubmitting(true);
    try {
      await create({ data: form });
      setSuccess(`Member ${form.fullName} created. Share their scholar code & password to sign in.`);
      setForm({ scholarCode: "", password: "", fullName: "", email: "", phone: "", course: "", mentoringSchool: "", makeAdmin: false });
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create member");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !isAdmin) {
    return (
      <AppLayout title="Manage Members">
        <p className="text-sm text-muted-foreground text-center py-10 px-4">Checking permissions…</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Manage Members" subtitle="Admin tools — add and manage members.">
      <section className="px-4 mt-4">
        <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="text-base font-extrabold text-[var(--brand)] flex items-center gap-2">
            <UserPlus className="h-5 w-5" /> Add New Member
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Scholar Code *" value={form.scholarCode} onChange={(v) => setForm({ ...form, scholarCode: v })} placeholder="2024/050/00001" required />
            <Field label="Temp Password *" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="min 6 chars" required type="text" />
            <Field label="Full Name *" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} required className="col-span-2" />
            <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
            <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="Course" value={form.course} onChange={(v) => setForm({ ...form, course: v })} className="col-span-2" />
            <Field label="Mentoring School" value={form.mentoringSchool} onChange={(v) => setForm({ ...form, mentoringSchool: v })} className="col-span-2" />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <input type="checkbox" checked={form.makeAdmin} onChange={(e) => setForm({ ...form, makeAdmin: e.target.checked })} />
            Grant admin access
          </label>
          {error && <p className="text-sm text-destructive font-semibold">{error}</p>}
          {success && <p className="text-sm text-[var(--brand)] font-semibold">{success}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[var(--brand)] text-brand-foreground font-bold py-2.5 rounded-lg shadow hover:bg-[var(--brand-deep)] transition-colors disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create Member"}
          </button>
        </form>
      </section>

      <section className="px-4 mt-6">
        <h3 className="text-base font-extrabold text-[var(--brand)] mb-2">All Members ({rows.length})</h3>
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-xl px-3 py-2.5">
              <p className="text-sm font-bold text-foreground">{r.full_name || "—"}</p>
              <p className="text-xs text-muted-foreground">{r.scholar_code}{r.course ? ` • ${r.course}` : ""}</p>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}

function Field({
  label, value, onChange, placeholder, required, type = "text", className = "",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-[10px] font-bold tracking-wider text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
      />
    </div>
  );
}
