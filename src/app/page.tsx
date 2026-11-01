import { CommunityCounters } from "@/components/sections/community-counters";
import { EventDetails } from "@/components/sections/event-details";
import { SiteFooter } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { Highlights } from "@/components/sections/highlights";
import { Invitation } from "@/components/sections/invitation";
import { RegistrationSection } from "@/components/sections/registration-form";
import { StickyMobileCta } from "@/components/sections/sticky-cta";

export default function HomePage() {
  return (
    <>
      <a
        href="#register"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to registration
      </a>
      <Hero />
      <Invitation />
      <EventDetails />
      <Highlights />
      <CommunityCounters />
      <RegistrationSection />
      <SiteFooter />
      <StickyMobileCta />
    </>
  );
}
