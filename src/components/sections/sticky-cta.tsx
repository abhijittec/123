"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StickyMobileCta() {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      const register = document.getElementById("register");
      if (!register) {
        setVisible(window.scrollY > 420);
        return;
      }
      const rect = register.getBoundingClientRect();
      const inRegisterView = rect.top < window.innerHeight * 0.75 && rect.bottom > 80;
      setVisible(window.scrollY > 420 && !inRegisterView);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:hidden">
      <Button
        className="gold-button h-12 w-full rounded-full text-sm font-semibold tracking-wide uppercase shadow-lg"
        onClick={() => {
          document
            .getElementById("register")
            ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
        }}
      >
        <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
        Confirm Your Participation
      </Button>
    </div>
  );
}
