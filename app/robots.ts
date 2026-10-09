import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/calculator", "/privacy"],
        // Private, per-user pages and API/auth endpoints shouldn't be indexed.
        disallow: ["/dashboard", "/account-settings", "/api/", "/auth/", "/reset-password"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}