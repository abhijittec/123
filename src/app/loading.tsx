import { Diya } from "@/components/festive/diya";

export default function Loading() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-4">
      <div className="flex items-end gap-3">
        <Diya size={40} />
        <Diya size={56} delay="0.35s" />
        <Diya size={40} delay="0.7s" />
      </div>
      <div className="text-center">
        <p className="font-display text-2xl text-gold-gradient">Lighting the diyas…</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Preparing your Sai Chethana Diwali invitation
        </p>
      </div>
    </div>
  );
}
