"use client";

import { motion, useReducedMotion } from "framer-motion";

const BURSTS = [
  { x: "18%", y: "22%", color: "#e7c56b", delay: 0 },
  { x: "78%", y: "18%", color: "#e8913a", delay: 1.2 },
  { x: "55%", y: "12%", color: "#c4b5fd", delay: 2.4 },
];

export function Fireworks() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {BURSTS.map((burst, index) => (
        <div
          key={index}
          className="absolute"
          style={{ left: burst.x, top: burst.y }}
        >
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i / 10) * Math.PI * 2;
            return (
              <motion.span
                key={i}
                className="absolute h-1 w-1 rounded-full"
                style={{ background: burst.color }}
                animate={{
                  x: [0, Math.cos(angle) * 36],
                  y: [0, Math.sin(angle) * 36],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2.8,
                  delay: burst.delay + i * 0.04,
                  repeat: Infinity,
                  repeatDelay: 2.2,
                  ease: "easeOut",
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
