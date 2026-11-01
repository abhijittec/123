"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/lib/config";

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

function getRemaining(now: number): Remaining {
  const target = new Date(EVENT.dateISO).getTime();
  const diff = Math.max(0, target - now);
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, done: false };
}

function Unit({ label, value }: { label: string; value: number }) {
  return (
    <div className="animate-countdown glass-panel flex min-w-[4.25rem] flex-col items-center rounded-2xl px-3 py-3 sm:min-w-[5rem] sm:px-4">
      <span className="font-display text-2xl font-semibold tabular-nums text-gold-soft sm:text-3xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export function Countdown() {
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(getRemaining(Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!remaining) {
    return (
      <div
        className="flex justify-center gap-2 sm:gap-3"
        aria-hidden="true"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="glass-panel h-[4.5rem] w-[4.25rem] animate-pulse rounded-2xl sm:w-[5rem]"
          />
        ))}
      </div>
    );
  }

  if (remaining.done) {
    return (
      <p className="text-center font-display text-lg text-gold-soft">
        The celebration has begun — Happy Diwali!
      </p>
    );
  }

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
      role="timer"
      aria-live="polite"
      aria-label="Countdown to Diwali celebration in Asia/Kolkata timezone"
    >
      <Unit label="Days" value={remaining.days} />
      <Unit label="Hours" value={remaining.hours} />
      <Unit label="Mins" value={remaining.minutes} />
      <Unit label="Secs" value={remaining.seconds} />
    </div>
  );
}
