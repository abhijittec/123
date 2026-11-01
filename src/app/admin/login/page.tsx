import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export const instant = false;

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-saffron">
          Association Committee
        </p>
        <h1 className="mt-3 font-display text-3xl text-gold-gradient">Admin Sign In</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Authorized members of Sai Chethana Apartment Welfare Association only.
        </p>
      </div>
      <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <Suspense fallback={<Skeleton className="h-40 w-full bg-white/10" />}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </main>
  );
}
