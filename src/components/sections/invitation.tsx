"use client";

import { motion } from "framer-motion";
import { EVENT } from "@/lib/config";

export function Invitation() {
  return (
    <section className="section-pad" aria-labelledby="invitation-heading">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="glass-panel relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] px-6 py-10 text-center sm:px-10 sm:py-12"
      >
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <p className="text-xs uppercase tracking-[0.3em] text-saffron">Cordial Invitation</p>
        <h2
          id="invitation-heading"
          className="mt-3 font-display text-3xl text-gold-gradient sm:text-4xl"
        >
          An Evening of Light & Belonging
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-foreground/90 sm:text-lg">
          {EVENT.invitation}
        </p>
        <div className="mt-8 space-y-1">
          <p className="text-sm text-muted-foreground">{EVENT.closing}</p>
          <p className="font-display text-lg text-gold-soft">{EVENT.organizer}</p>
        </div>
      </motion.div>
    </section>
  );
}
