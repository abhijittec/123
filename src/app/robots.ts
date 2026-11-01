import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/edit/"],
    },
    sitemap: `${site}/sitemap.xml`,
  };
}
