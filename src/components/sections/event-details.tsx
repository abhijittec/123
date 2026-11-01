"use client";

import { motion } from "framer-motion";
import { CalendarHeart, Clock, MapPinned, UsersRound } from "lucide-react";
import { EVENT } from "@/lib/config";

const ITEMS = [
  {
    icon: CalendarHeart,
    label: "Date",
    value: `${EVENT.weekday}, ${EVENT.dateLabel}`,
  },
  {
    icon: Clock,
    label: "Time",
    value: EVENT.timeLabel,
  },
  {
    icon: MapPinned,
    label: "Venue",
    value: EVENT.venue,
  },
  {
    icon: UsersRound,
    label: "Organized by",
    value: EVENT.organizer,
  },
];

export function EventDetails() {
  return (
    <section id="details" className="section-pad scroll-mt-24" aria-labelledby="details-heading">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-saffron">Event Details</p>
          <h2
            id="details-heading"
            className="mt-3 font-display text-3xl text-gold-gradient sm:text-4xl"
          >
            Celebration Essentials
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Everything you need to know to join the Sai Chethana Diwali evening.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {ITEMS.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="glass-panel rounded-3xl p-6"
            >
              <item.icon className="h-5 w-5 text-gold" aria-hidden="true" />
              <p className="mt-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-2 font-display text-xl text-foreground">{item.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
