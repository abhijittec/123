import { EVENT } from "@/lib/config";
import { WhatsAppShareButton } from "@/components/sections/share-button";

export function SiteFooter() {
  return (
    <footer className="section-pad border-t border-gold/15 pb-28 sm:pb-16">
      <div className="mx-auto max-w-3xl space-y-8 text-center">
        <WhatsAppShareButton />
        <div>
          <p className="font-display text-lg text-gold-soft">
            Made with love for the Sai Chethana Apartment Community
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Organized by {EVENT.organizer}
          </p>
        </div>
      </div>
    </footer>
  );
}
