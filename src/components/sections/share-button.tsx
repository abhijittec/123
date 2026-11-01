"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENT, getSiteUrl } from "@/lib/config";

export function WhatsAppShareButton() {
  const [status, setStatus] = useState<string | null>(null);

  const shareText = [
    `🪔 ${EVENT.title}`,
    EVENT.tagline,
    EVENT.taglineSupport,
    "",
    `${EVENT.weekday}, ${EVENT.dateLabel}`,
    EVENT.timeLabel,
    EVENT.venue,
    "",
    "Confirm your family's participation:",
  ].join("\n");

  async function share() {
    const url =
      typeof window !== "undefined" ? window.location.origin : getSiteUrl();
    const fullText = `${shareText}\n${url}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: EVENT.title,
          text: shareText,
          url,
        });
        setStatus("Invitation shared");
        return;
      }
    } catch {
      // fall through to WhatsApp
    }

    const wa = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
    window.open(wa, "_blank", "noopener,noreferrer");
    setStatus("Opening WhatsApp…");
  }

  return (
    <div className="text-center">
      <Button
        type="button"
        onClick={share}
        className="h-12 rounded-full border border-gold/30 bg-[#25D366]/15 px-6 text-sm font-medium text-foreground hover:bg-[#25D366]/25"
        variant="outline"
      >
        <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
        WhatsApp Share Invitation
      </Button>
      {status ? (
        <p className="mt-2 text-xs text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
