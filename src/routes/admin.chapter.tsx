import { createFileRoute } from "@tanstack/react-router";
import { PermissionGate } from "@/components/AppLayout";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin/chapter")({
  head: () => ({ meta: [{ title: "Chapter Profile — MMUST ELP" }] }),
  component: () => <PermissionGate perm="profile.chapter.edit" title="Chapter Profile"><Page /></PermissionGate>,
});

function Page() {
  const [id, setId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", motto: "", about: "", contact_email: "", contact_phone: "" });
  useEffect(() => {
    supabase.from("chapter_profile").select("*").limit(1).maybeSingle().then(({ data }) => {
      if (data) {
        setId(data.id);
        setForm({
          name: data.name ?? "", motto: data.motto ?? "", about: data.about ?? "",
          contact_email: data.contact_email ?? "", contact_phone: data.contact_phone ?? "",
        });
      }
    });
  }, []);
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const { error } = await supabase.from("chapter_profile").update({
      ...form, updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Chapter profile updated.");
  };
  return (
    <>
      <Toaster />
      <section className="px-4 mt-4">
        <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <input required placeholder="Chapter name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input placeholder="Motto" value={form.motto} onChange={(e) => setForm({ ...form, motto: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <textarea placeholder="About" rows={4} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input type="email" placeholder="Contact email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input placeholder="Contact phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <button className="w-full bg-[var(--brand)] text-brand-foreground font-bold py-2.5 rounded-lg">Save</button>
        </form>
      </section>
    </>
  );
}
