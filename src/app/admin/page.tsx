import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminDashboard } from "@/components/admin/dashboard";
import { getAdminUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { Skeleton } from "@/components/ui/skeleton";

export const instant = false;

async function AdminGate() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl text-gold-gradient">Admin unavailable</h1>
        <p className="mt-4 text-muted-foreground">
          Configure Supabase environment variables and seed an admin profile to use this
          dashboard.
        </p>
      </main>
    );
  }

  const admin = await getAdminUser();
  if (!admin) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <Skeleton className="h-10 w-64 bg-white/10" />
          <Skeleton className="h-40 w-full bg-white/10" />
        </div>
      }
    >
      <AdminGate />
    </Suspense>
  );
}
