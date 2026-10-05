import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-serif",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GWA Calculator — General Weighted Average, instantly",
    template: "%s · GWA Calculator",
  },
  description:
    "Calculate your General Weighted Average (GWA) for free. Built for Philippine college grading systems, works as a guest, no sign-up required. Save your results if you want a record of them.",
  keywords: [
    "GWA calculator",
    "General Weighted Average calculator",
    "college GWA calculator",
    "Philippines GWA calculator",
    "GPA to GWA",
  ],
  openGraph: {
    title: "GWA Calculator — General Weighted Average, instantly",
    description:
      "A fast, free GWA calculator for Philippine college students. No account needed to calculate.",
    url: siteUrl,
    siteName: "GWA Calculator",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "GWA Calculator",
    description: "Calculate your General Weighted Average in seconds. No account needed.",
  },
  alternates: {
    canonical: "/",
  },
  // Rendered as <link rel="icon" ...>, <link rel="apple-touch-icon" ...> and
  // <link rel="manifest" ...>. Files live in /public.
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  appleWebApp: { capable: true, title: "GWA Calc", statusBarStyle: "default" },
};

export const viewport = {
  themeColor: "#F6F7F5",
  colorScheme: "light",
};

// Light is the default on every page. Dark is applied only if the person switched to it earlier in
// this browser tab (sessionStorage), so a new visit always opens in light mode. Any old
// "theme" value left in localStorage by a previous version is ignored and cleared.
// Static string (no user input), so injecting it is safe.
const THEME_INIT_SCRIPT = `(function(){try{localStorage.removeItem("theme")}catch(e){}try{if(sessionStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        {/* Applies the tab's chosen theme (light by default) before first paint to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_INIT_SCRIPT,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-paper font-sans text-ink-900 antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-md focus:bg-ledger-700 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        <SiteHeader />
        <div id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </div>
        <SiteFooter />
        <ServiceWorkerRegister />
        <Analytics />
      </body>
    </html>
  );
}