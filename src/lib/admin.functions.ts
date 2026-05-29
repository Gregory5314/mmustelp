import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { scholarCodeToEmail } from "./scholar";

const FIRST_ADMIN_CODE = "2018/050/14879";
const FIRST_ADMIN_PASSWORD = "ChangeMe123!";
const FIRST_ADMIN_NAME = "Chapter Admin";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Only admins can perform this action.");
}

// Idempotent: creates the first admin account if no admin exists.
// Safe to call from a public endpoint because it short-circuits once an admin exists.
export const bootstrapFirstAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { count, error: countErr } = await supabaseAdmin
    .from("user_roles")
    .select("id", { head: true, count: "exact" })
    .eq("role", "admin");
  if (countErr) throw new Error(countErr.message);
  if ((count ?? 0) > 0) return { created: false };

  const email = scholarCodeToEmail(FIRST_ADMIN_CODE);
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: FIRST_ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      scholar_code: FIRST_ADMIN_CODE,
      full_name: FIRST_ADMIN_NAME,
    },
  });
  if (createErr) throw new Error(createErr.message);
  const userId = created.user?.id;
  if (!userId) throw new Error("Failed to create first admin user.");

  const { error: roleErr } = await supabaseAdmin
    .from("user_roles")
    .insert({ user_id: userId, role: "admin" });
  if (roleErr) throw new Error(roleErr.message);

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
  makeAdmin: z.boolean().optional(),
});

export const createMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateMemberInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    const authEmail = scholarCodeToEmail(data.scholarCode);
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: authEmail,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        scholar_code: data.scholarCode,
        full_name: data.fullName,
        contact_email: data.email || null,
        phone: data.phone || null,
        course: data.course || null,
        mentoring_school: data.mentoringSchool || null,
      },
    });
    if (createErr) throw new Error(createErr.message);
    const newUserId = created.user?.id;
    if (!newUserId) throw new Error("Could not create member.");

    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUserId, role: data.makeAdmin ? "admin" : "member" });
    if (roleErr) throw new Error(roleErr.message);

    return { id: newUserId, scholarCode: data.scholarCode };
  });

const ResetPasswordInput = z.object({
  userId: z.string().uuid(),
  newPassword: z.string().min(6).max(72),
});

export const resetMemberPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ResetPasswordInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.newPassword,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
