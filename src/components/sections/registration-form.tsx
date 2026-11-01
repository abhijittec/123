"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { REGISTRATION } from "@/lib/config";

const EDIT_STORAGE_KEY = "sai-chethana-diwali-edit-token";

function subscribeEditToken(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function readEditPath() {
  try {
    const token = window.localStorage.getItem(EDIT_STORAGE_KEY);
    return token ? `/edit/${token}` : null;
  } catch {
    return null;
  }
}

type FieldErrors = {
  flatNumber?: string[];
  headCount?: string[];
  kidsUnder10?: string[];
  residentName?: string[];
};

type SuccessState = {
  message: string;
  flatNumber: string;
  headCount: number;
  kidsUnder10: number;
  editPath: string;
};

function Stepper({
  id,
  value,
  min,
  max,
  onChange,
  describedBy,
  invalid,
}: {
  id: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  describedBy?: string;
  invalid?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-xl border-gold/30 bg-white/5"
        onClick={() => value > min && onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        id={id}
        name={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (Number.isNaN(next)) return;
          onChange(Math.min(max, Math.max(min, next)));
        }}
        className="h-12 rounded-xl border-gold/25 bg-navy-deep/50 text-center text-lg tabular-nums"
        aria-invalid={invalid}
        aria-describedby={describedBy}
        required
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-xl border-gold/30 bg-white/5"
        onClick={() => value < max && onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function RegistrationForm() {
  const [flatNumber, setFlatNumber] = useState("");
  const [residentName, setResidentName] = useState("");
  const [headCount, setHeadCount] = useState(2);
  const [kidsUnder10, setKidsUnder10] = useState(0);
  const [website, setWebsite] = useState("");
  const [formOpenedAt] = useState(() => Date.now());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const storedEditPath = useSyncExternalStore(
    subscribeEditToken,
    readEditPath,
    () => null,
  );
  const [sessionEditPath, setSessionEditPath] = useState<string | null>(null);
  const savedEditPath = sessionEditPath ?? storedEditPath;

  const helper = useMemo(
    () => `Between ${REGISTRATION.minHeadCount} and ${REGISTRATION.maxHeadCount} people`,
    [],
  );

  function updateHeadCount(next: number) {
    setHeadCount(next);
    setKidsUnder10((kids) => Math.min(kids, next));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setFormError(null);
    setAlreadyRegistered(false);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flatNumber,
          headCount,
          kidsUnder10,
          residentName: residentName || null,
          website,
          formOpenedAt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) setErrors(data.details);
        setFormError(data.error || "Something went wrong");
        if (data.alreadyRegistered || data.code === "ALREADY_REGISTERED") {
          setAlreadyRegistered(true);
        }
        return;
      }

      try {
        window.localStorage.setItem(EDIT_STORAGE_KEY, data.editToken);
      } catch {
        // ignore
      }

      setSuccess({
        message: data.message,
        flatNumber: data.registration.flatNumber,
        headCount: data.registration.headCount,
        kidsUnder10: data.registration.kidsUnder10,
        editPath: data.editPath,
      });
      setSessionEditPath(data.editPath);
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-[2rem] p-6 text-center sm:p-10"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="mx-auto h-12 w-12 text-gold" aria-hidden="true" />
        <h3 className="mt-4 font-display text-2xl text-gold-gradient sm:text-3xl">
          Participation Confirmed
        </h3>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-foreground/90 sm:text-base">
          {success.message}
        </p>
        <div className="mx-auto mt-6 grid max-w-sm gap-3 text-left">
          <div className="rounded-2xl border border-gold/20 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Flat Number
            </p>
            <p className="mt-1 font-display text-xl text-gold-soft">{success.flatNumber}</p>
          </div>
          <div className="rounded-2xl border border-gold/20 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Total Head Count
            </p>
            <p className="mt-1 font-display text-xl text-gold-soft">{success.headCount}</p>
          </div>
          <div className="rounded-2xl border border-gold/20 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Kids Under 10
            </p>
            <p className="mt-1 font-display text-xl text-gold-soft">{success.kidsUnder10}</p>
          </div>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Save your private edit link to update later:
        </p>
        <Link
          href={success.editPath}
          className="mt-3 inline-flex h-11 items-center justify-center rounded-full border border-gold/30 bg-white/5 px-5 text-sm hover:bg-white/10"
        >
          Open Private Edit Link
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
      <form onSubmit={onSubmit} className="relative space-y-6" noValidate>
        <div className="space-y-2">
          <Label htmlFor="flatNumber" className="text-gold-soft">
            Flat Number <span className="text-saffron">*</span>
          </Label>
          <Input
            id="flatNumber"
            name="flatNumber"
            inputMode="text"
            autoComplete="off"
            placeholder="e.g. A-101 or 101"
            value={flatNumber}
            onChange={(e) => setFlatNumber(e.target.value)}
            className="h-12 rounded-xl border-gold/25 bg-navy-deep/50 text-base"
            aria-invalid={Boolean(errors.flatNumber)}
            aria-describedby={errors.flatNumber ? "flatNumber-error" : "flatNumber-help"}
            required
          />
          <p id="flatNumber-help" className="text-xs text-muted-foreground">
            Enter your flat as you use it day-to-day. No tower format is assumed.
          </p>
          {errors.flatNumber?.[0] ? (
            <p id="flatNumber-error" className="text-sm text-destructive" role="alert">
              {errors.flatNumber[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="headCount" className="text-gold-soft">
            Total Head Count <span className="text-saffron">*</span>
          </Label>
          <Stepper
            id="headCount"
            value={headCount}
            min={REGISTRATION.minHeadCount}
            max={REGISTRATION.maxHeadCount}
            onChange={updateHeadCount}
            describedBy="headCount-help"
            invalid={Boolean(errors.headCount)}
          />
          <p id="headCount-help" className="text-xs text-muted-foreground">
            {helper}
          </p>
          {errors.headCount?.[0] ? (
            <p className="text-sm text-destructive" role="alert">
              {errors.headCount[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="kidsUnder10" className="text-gold-soft">
            Kids Under 10 Years <span className="text-saffron">*</span>
          </Label>
          <Stepper
            id="kidsUnder10"
            value={kidsUnder10}
            min={REGISTRATION.minKidsUnder10}
            max={headCount}
            onChange={setKidsUnder10}
            describedBy="kidsUnder10-help"
            invalid={Boolean(errors.kidsUnder10)}
          />
          <p id="kidsUnder10-help" className="text-xs text-muted-foreground">
            How many children below 10 years are coming? (included in total head count)
          </p>
          {errors.kidsUnder10?.[0] ? (
            <p className="text-sm text-destructive" role="alert">
              {errors.kidsUnder10[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="residentName" className="text-gold-soft">
            Resident Name <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="residentName"
            name="residentName"
            autoComplete="name"
            placeholder="Your name"
            value={residentName}
            onChange={(e) => setResidentName(e.target.value)}
            className="h-12 rounded-xl border-gold/25 bg-navy-deep/50 text-base"
            aria-invalid={Boolean(errors.residentName)}
          />
          {errors.residentName?.[0] ? (
            <p className="text-sm text-destructive" role="alert">
              {errors.residentName[0]}
            </p>
          ) : null}
        </div>

        <div className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {formError ? (
          <div
            className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            <p>{formError}</p>
            {alreadyRegistered && savedEditPath ? (
              <p className="mt-2">
                <Link href={savedEditPath} className="underline underline-offset-4">
                  Open your saved edit link
                </Link>
              </p>
            ) : null}
            {alreadyRegistered && !savedEditPath ? (
              <p className="mt-2 text-muted-foreground">
                If you registered earlier on this phone, check your confirmation message for the
                private edit link, or ask the association committee for help.
              </p>
            ) : null}
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="gold-button h-12 w-full rounded-full text-sm font-semibold tracking-wide uppercase"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Confirming…
            </>
          ) : (
            "Confirm Participation"
          )}
        </Button>

        {savedEditPath ? (
          <p className="text-center text-xs text-muted-foreground">
            Already registered on this device?{" "}
            <Link href={savedEditPath} className="text-gold underline-offset-4 hover:underline">
              Edit your response
            </Link>
          </p>
        ) : null}
      </form>
    </div>
  );
}

export function RegistrationSection() {
  return (
    <section id="register" className="section-pad scroll-mt-24" aria-labelledby="register-heading">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-saffron">RSVP</p>
          <h2
            id="register-heading"
            className="mt-3 font-display text-3xl leading-tight text-balance text-gold-gradient sm:text-4xl"
          >
            Light Up the Celebration — Register Your Family
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            Please confirm your participation so we can make suitable arrangements for everyone.
          </p>
        </div>
        <RegistrationForm />
      </div>
    </section>
  );
}
