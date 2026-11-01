"use client";

import { useMemo, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Particle = {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
  color: string;
};

const COLORS = ["#e7c56b", "#f4df9b", "#e8913a", "#f0a202", "#c4b5fd"];

function subscribe() {
  return () => undefined;
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function FestiveParticles({ count = 28 }: { count?: number }) {
  const reduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${(i * 37) % 100}%`,
      top: `${(i * 53) % 100}%`,
      size: 2 + (i % 4),
      delay: (i % 10) * 0.35,
      duration: 3.5 + (i % 5),
      color: COLORS[i % COLORS.length]!,
    }));
  }, [count]);

  if (!mounted || reduceMotion) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{ opacity: [0.15, 0.85, 0.15], scale: [0.8, 1.2, 0.8] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
