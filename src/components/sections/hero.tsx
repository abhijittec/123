"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Clock3, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Diya } from "@/components/festive/diya";
import { FairyLights } from "@/components/festive/fairy-lights";
import { Fireworks } from "@/components/festive/fireworks";
import { FestiveParticles } from "@/components/festive/particles";
import { Lantern } from "@/components/festive/lantern";
import { Rangoli } from "@/components/festive/rangoli";
import { Countdown } from "@/components/sections/countdown";
import { EVENT } from "@/lib/config";

export function Hero() {
  const reduceMotion = useReducedMotion();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <header className="relative isolate min-h-[100dvh] overflow-hidden">
      <FestiveParticles count={24} />
      <Fireworks />
      <FairyLights />

      <div className="pointer-events-none absolute -left-10 top-28 opacity-70 sm:left-6">
        <Lantern delay="0.2s" />
      </div>
      <div className="pointer-events-none absolute -right-8 top-36 opacity-70 sm:right-8">
        <Lantern delay="1.1s" />
      </div>

      <Rangoli className="pointer-events-none absolute -bottom-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 opacity-25 sm:h-[34rem] sm:w-[34rem]" />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-5xl flex-col items-center justify-center px-4 pb-28 pt-20 text-center sm:px-6">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-3"
        >
          <Diya size={42} />
          <Diya size={54} delay="0.4s" />
          <Diya size={42} delay="0.8s" />
        </motion.div>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mt-8 font-display text-2xl font-semibold tracking-[0.08em] text-gold-gradient sm:text-4xl md:text-5xl"
        >
          {EVENT.apartment}
        </motion.p>

        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.65 }}
          className="mt-4 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl md:text-6xl"
        >
          {EVENT.shortTitle}
        </motion.h1>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-4 max-w-2xl font-display text-lg text-gold-soft/90 sm:text-xl"
        >
          {EVENT.tagline}
        </motion.p>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.55 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-white/5 px-3 py-1.5">
            <CalendarDays className="h-4 w-4 text-gold" aria-hidden="true" />
            {EVENT.weekday}, {EVENT.dateLabel}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-white/5 px-3 py-1.5">
            <Clock3 className="h-4 w-4 text-saffron" aria-hidden="true" />
            {EVENT.timeLabel}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-white/5 px-3 py-1.5">
            <MapPin className="h-4 w-4 text-marigold" aria-hidden="true" />
            {EVENT.venue}
          </span>
        </motion.div>

        <p className="mt-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Organized by {EVENT.organizer}
        </p>

        <div className="mt-10 w-full max-w-lg">
          <Countdown />
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.55 }}
          className="mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center"
        >
          <Button
            size="lg"
            className="gold-button h-12 rounded-full px-8 text-sm font-semibold tracking-wide uppercase"
            onClick={() => scrollTo("register")}
          >
            <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
            Confirm Your Participation
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 rounded-full border-gold/35 bg-white/5 px-8 text-sm tracking-wide text-foreground hover:bg-white/10"
            onClick={() => scrollTo("details")}
          >
            View Celebration Details
          </Button>
        </motion.div>
      </div>
    </header>
  );
}
