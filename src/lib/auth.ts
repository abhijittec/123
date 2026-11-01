import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type AdminUser = {
  id: string;
  email: string | null;
  role: "admin" | "superadmin";
  displayName: string | null;
};

export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = getSupabaseAdmin();
  const { data: profile, error } = await admin
    .from("admin_profiles")
    .select("role, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !profile) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    role: profile.role as "admin" | "superadmin",
    displayName: profile.display_name ?? null,
  };
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) {
    throw new Error("UNAUTHORIZED");
  }
  return admin;
}
