const isDev = process.env.NODE_ENV !== "production";

// Supabase is the only third-party origin the browser talks to directly
// (auth + data), plus Cloudflare Turnstile for the CAPTCHA widget.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
let supabaseOrigin = "";
let supabaseWs = "";
try {
  if (supabaseUrl) {
    const u = new URL(supabaseUrl);
    supabaseOrigin = u.origin;
    supabaseWs = `wss://${u.host}`;
  }
} catch {
  // Invalid URL in env: leave empty; the app will fail loudly elsewhere.
}

/**
 * Content-Security-Policy.
 *
 * 'unsafe-inline' for scripts is required because Next.js emits inline
 * bootstrap scripts (and we use a tiny inline script to apply the saved theme
 * before first paint, avoiding a flash). If you later want a stricter policy,
 * switch to nonce-based CSP via middleware (see Next.js docs).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}https://challenges.cloudflare.com https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${supabaseWs} https://challenges.cloudflare.com https://vitals.vercel-insights.com https://va.vercel-scripts.com ${isDev ? "ws://localhost:* http://localhost:*" : ""}`.replace(/\s+/g, " ").trim(),
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Clickjacking (legacy browsers; CSP frame-ancestors covers modern ones).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
