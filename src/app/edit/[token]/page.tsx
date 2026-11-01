"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Loader2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { REGISTRATION } from "@/lib/config";

type Registration = {
  flatNumber: string;
  residentName: string | null;
  headCount: number;
  kidsUnder10: number;
};

function Stepper({
  id,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-xl border-gold/30 bg-white/5"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-12 rounded-xl border-gold/25 bg-navy-deep/50 text-center"
        required
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-xl border-gold/30 bg-white/5"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function EditRegistrationPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [flatNumber, setFlatNumber] = useState("");
  const [residentName, setResidentName] = useState("");
  const [headCount, setHeadCount] = useState(1);
  const [kidsUnder10, setKidsUnder10] = useState(0);
  const [formOpenedAt] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/register/${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(data.error || "Unable to load registration");
          return;
        }
        const reg = data.registration as Registration;
        if (!cancelled) {
          setFlatNumber(reg.flatNumber);
          setResidentName(reg.residentName ?? "");
          setHeadCount(reg.headCount);
          setKidsUnder10(reg.kidsUnder10 ?? 0);
        }
      } catch {
        if (!cancelled) setError("Network error while loading your registration");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (token) load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/register/${encodeURIComponent(token)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flatNumber,
          headCount,
          kidsUnder10,
          residentName: residentName || null,
          formOpenedAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to update");
        return;
      }
      setSuccess(data.message);
      setFlatNumber(data.registration.flatNumber);
      setHeadCount(data.registration.headCount);
      setKidsUnder10(data.registration.kidsUnder10 ?? 0);
      setResidentName(data.registration.residentName ?? "");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto min-h-[100dvh] max-w-lg px-4 py-12 sm:py-16">
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-saffron">Private Edit Link</p>
        <h1 className="mt-3 font-display text-3xl text-gold-gradient">
          Update Your Registration
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Only you can access this link. Do not share it publicly.
        </p>
      </div>

      <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full bg-white/10" />
            <Skeleton className="h-12 w-full bg-white/10" />
            <Skeleton className="h-12 w-full bg-white/10" />
          </div>
        ) : error && !flatNumber ? (
          <div className="space-y-4 text-center">
            <p className="text-destructive" role="alert">
              {error}
            </p>
            <Link
              href="/#register"
              className="inline-flex h-11 items-center justify-center rounded-full border border-gold/30 px-5 text-sm hover:bg-white/10"
            >
              Back to invitation
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="flatNumber">Flat Number</Label>
              <Input
                id="flatNumber"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                className="h-12 rounded-xl border-gold/25 bg-navy-deep/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="headCount">Total Head Count</Label>
              <Stepper
                id="headCount"
                value={headCount}
                min={REGISTRATION.minHeadCount}
                max={REGISTRATION.maxHeadCount}
                onChange={(next) => {
                  setHeadCount(next);
                  setKidsUnder10((kids) => Math.min(kids, next));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kidsUnder10">Kids Under 10 Years</Label>
              <Stepper
                id="kidsUnder10"
                value={kidsUnder10}
                min={REGISTRATION.minKidsUnder10}
                max={headCount}
                onChange={setKidsUnder10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="residentName">Resident Name (optional)</Label>
              <Input
                id="residentName"
                value={residentName}
                onChange={(e) => setResidentName(e.target.value)}
                className="h-12 rounded-xl border-gold/25 bg-navy-deep/50"
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="flex items-center gap-2 text-sm text-gold-soft" role="status">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {success}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={saving}
              className="gold-button h-12 w-full rounded-full uppercase tracking-wide"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>

            <div className="text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-gold">
                Back to invitation
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
