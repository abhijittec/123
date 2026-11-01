"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Baby, Home, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function AnimatedNumber({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const spring = useSpring(value, { stiffness: 70, damping: 20 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString("en-IN"),
  );
  const [text, setText] = useState(() => value.toLocaleString("en-IN"));

  useEffect(() => {
    if (reduceMotion) return;
    spring.set(value);
    return display.on("change", (latest) => {
      setText(latest);
    });
  }, [value, spring, display, reduceMotion]);

  if (reduceMotion) {
    return <span className="tabular-nums">{value.toLocaleString("en-IN")}</span>;
  }

  return <span className="tabular-nums">{text}</span>;
}

export function CommunityCounters() {
  const [stats, setStats] = useState<{
    totalFlats: number;
    totalParticipants: number;
    totalKidsUnder10: number;
    configured?: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (!cancelled) {
          setStats(data);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Unable to refresh community totals");
      }
    };

    load();
    const id = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <section className="section-pad" aria-labelledby="community-counters-heading">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-saffron">Community Glow</p>
        <h2
          id="community-counters-heading"
          className="mt-3 font-display text-3xl text-gold-gradient sm:text-4xl"
        >
          Families Lighting Up Together
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Live totals from confirmed registrations — only aggregate numbers are shown.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel rounded-3xl p-6 sm:p-8"
          >
            <Home className="mx-auto h-6 w-6 text-gold" aria-hidden="true" />
            <p className="mt-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Total Flats Registered
            </p>
            <p className="mt-3 font-display text-4xl text-gold-soft sm:text-5xl">
              {stats ? (
                <AnimatedNumber value={stats.totalFlats} />
              ) : (
                <Skeleton className="mx-auto h-12 w-24 bg-white/10" />
              )}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-panel rounded-3xl p-6 sm:p-8"
          >
            <Users className="mx-auto h-6 w-6 text-saffron" aria-hidden="true" />
            <p className="mt-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Total Participants
            </p>
            <p className="mt-3 font-display text-4xl text-gold-soft sm:text-5xl">
              {stats ? (
                <AnimatedNumber value={stats.totalParticipants} />
              ) : (
                <Skeleton className="mx-auto h-12 w-24 bg-white/10" />
              )}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="glass-panel rounded-3xl p-6 sm:p-8"
          >
            <Baby className="mx-auto h-6 w-6 text-marigold" aria-hidden="true" />
            <p className="mt-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Kids Under 10
            </p>
            <p className="mt-3 font-display text-4xl text-gold-soft sm:text-5xl">
              {stats ? (
                <AnimatedNumber value={stats.totalKidsUnder10 ?? 0} />
              ) : (
                <Skeleton className="mx-auto h-12 w-24 bg-white/10" />
              )}
            </p>
          </motion.div>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-destructive" role="status">
            {error}
          </p>
        ) : null}
        {stats && stats.configured === false ? (
          <p className="mt-4 text-sm text-muted-foreground" role="status">
            Counters will appear once Supabase is connected.
          </p>
        ) : null}
      </div>
    </section>
  );
}
