"use client";

import { motion } from "framer-motion";
import { HeartHandshake, Sparkle, Home, Camera } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: HeartHandshake,
    title: "Community Togetherness",
    description:
      "Reconnect with neighbours and celebrate the spirit of Sai Chethana as one family.",
  },
  {
    icon: Sparkle,
    title: "Festive Atmosphere",
    description:
      "Warm lights, joyful conversations, and the glow of Diwali across our premises.",
  },
  {
    icon: Home,
    title: "Family Celebration",
    description:
      "An evening designed for residents of every age to share laughter and belonging.",
  },
  {
    icon: Camera,
    title: "Memorable Moments",
    description:
      "Create beautiful memories with the people who make our apartment a home.",
  },
];

export function Highlights() {
  return (
    <section className="section-pad" aria-labelledby="highlights-heading">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-saffron">Festive Highlights</p>
          <h2
            id="highlights-heading"
            className="mt-3 font-display text-3xl text-gold-gradient sm:text-4xl"
          >
            What Makes This Evening Special
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            A warm community gathering — simple, elegant, and full of Diwali spirit.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {HIGHLIGHTS.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-3xl border border-gold/15 bg-gradient-to-br from-white/[0.06] to-royal/10 p-6"
            >
              <item.icon className="h-5 w-5 text-marigold" aria-hidden="true" />
              <h3 className="mt-4 font-display text-xl text-gold-soft">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
