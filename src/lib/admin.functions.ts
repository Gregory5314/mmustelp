import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { scholarCodeToEmail } from "./scholar";

const FIRST_ADMIN_CODE = "2018/050/14879";
const FIRST_ADMIN_PASSWORD = "ChangeMe123!";
const FIRST_ADMIN_NAME = "Chapter Admin";

const ALL_ROLES = [
  "admin", "member", "president", "vice_president", "treasurer", "event_manager",
  "comm_officer_y1", "comm_officer_y2", "comm_officer_y3", "comm_officer_y4",
  "secretary_general", "assistant_secretary", "alumni_manager",
  "mentorship_coordinator", "welfare_coordinator",
] as const;
type Role = (typeof ALL_ROLES)[number];

async function assertPermission(userId: string, permission: string) {
  const { data, error } = await supabaseAdmin.rpc("has_permission", {
    _user_id: userId, _permission: permission,
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error(`Missing permission: ${permission}`);
}

// Bootstrap first admin (idempotent, public)
export const bootstrapFirstAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { count, error: countErr } = await supabaseAdmin
    .from("user_roles").select("id", { head: true, count: "exact" }).eq("role", "admin");
  if (countErr) throw new Error(countErr.message);
  if ((count ?? 0) > 0) return { created: false };

  const email = scholarCodeToEmail(FIRST_ADMIN_CODE);
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email, password: FIRST_ADMIN_PASSWORD, email_confirm: true,
    user_metadata: { scholar_code: FIRST_ADMIN_CODE, full_name: FIRST_ADMIN_NAME },
  });
  if (createErr) throw new Error(createErr.message);
  const userId = created.user?.id;
  if (!userId) throw new Error("Failed to create first admin user.");

  await supabaseAdmin.from("user_roles").insert([
    { user_id: userId, role: "admin" },
    { user_id: userId, role: "president" },
  ]);
  return { created: true, scholarCode: FIRST_ADMIN_CODE, tempPassword: FIRST_ADMIN_PASSWORD };
});

const CreateMemberInput = z.object({
  scholarCode: z.string().trim().min(3).max(64),
  password: z.string().min(6).max(72),
  fullName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  course: z.string().trim().max(160).optional().or(z.literal("")),
  mentoringSchool: z.string().trim().max(160).optional().or(z.literal("")),
  year: z.number().int().min(1).max(8).optional(),
  role: z.enum(ALL_ROLES).default("member"),
});

export const createMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateMemberInput.parse(input))
  .handler(async ({ data, context }) => {
    // Year-scoped officers can only add members in their year
    const isAdminLike = await supabaseAdmin.rpc("has_permission", {
      _user_id: context.userId, _permission: "members.add.any",
    });
    if (!isAdminLike.data) {
      if (!data.year) throw new Error("Year is required for year-scoped officers.");
      const perm = `members.add.y${data.year}`;
      await assertPermission(context.userId, perm);
    }

    // Only president can grant elevated roles
    const elevated: Role[] = ["admin", "president", "vice_president"];
    if (elevated.includes(data.role)) {
      await assertPermission(context.userId, "admins.manage");
    }

    const authEmail = scholarCodeToEmail(data.scholarCode);
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: authEmail, password: data.password, email_confirm: true,
      user_metadata: {
        scholar_code: data.scholarCode, full_name: data.fullName,
        contact_email: data.email || null, phone: data.phone || null,
        course: data.course || null, mentoring_school: data.mentoringSchool || null,
      },
    });
    if (createErr) throw new Error(createErr.message);
    const newUserId = created.user?.id;
    if (!newUserId) throw new Error("Could not create member.");

    if (data.year) {
      await supabaseAdmin.from("profiles").update({ year: data.year }).eq("id", newUserId);
    }
    await supabaseAdmin.from("user_roles").insert({ user_id: newUserId, role: data.role });
    await supabaseAdmin.from("subscriptions").upsert({ profile_id: newUserId, status: "inactive" });
    return { id: newUserId, scholarCode: data.scholarCode };
  });

export const resetMemberPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    userId: z.string().uuid(), newPassword: z.string().min(6).max(72),
  }).parse(input))
  .handler(async ({ data, context }) => {
    await assertPermission(context.userId, "admins.manage");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { password: data.newPassword });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const assignRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    userId: z.string().uuid(),
    role: z.enum(ALL_ROLES),
  }).parse(input))
  .handler(async ({ data, context }) => {
    await assertPermission(context.userId, "admins.manage");
    const { error } = await supabaseAdmin.from("user_roles")
      .insert({ user_id: data.userId, role: data.role });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });

export const removeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    userId: z.string().uuid(),
    role: z.enum(ALL_ROLES),
  }).parse(input))
  .handler(async ({ data, context }) => {
    await assertPermission(context.userId, "admins.manage");
    const { error } = await supabaseAdmin.from("user_roles")
      .delete().eq("user_id", data.userId).eq("role", data.role);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertPermission(context.userId, "admins.manage");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
