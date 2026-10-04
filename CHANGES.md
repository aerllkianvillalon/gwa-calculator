# Changed files (copy each into the same path in your project)

After copying, run:  `npm install`  (package.json changed: Next 15.5.27, React 19, Vitest 3) then `npm test`.

## Security
- lib/security/safe-redirect.ts            NEW  same-site redirect validator
- tests/safe-redirect.test.ts              NEW  19 tests
- app/auth/callback/route.ts               open-redirect fix + invalid-link handling
- components/auth/login-form.tsx           validated redirect + expired-link notice
- components/auth/register-form.tsx        validated redirect
- next.config.mjs                          CSP, HSTS, X-Frame-Options, etc.
- lib/calculator/pending-calculation.ts    validates sessionStorage data with zod
- app/api/calculations/route.ts            fixed inverted error-message logic
- app/api/calculations/[id]/route.ts       Next 15 async params + UUID check
- package.json / package-lock.json         Next 15.5.27, React 19, Vitest 3.2.x

## Design / missing pieces
- tailwind.config.ts, app/globals.css      CSS-variable tokens + dark mode
- components/ui/button.tsx                 theme-aware hover colours
- app/layout.tsx                           header, footer, skip link, theme init
- components/layout/site-header.tsx        NEW  menu bar + logo mark
- components/layout/site-nav.tsx           NEW  desktop/mobile nav, active link
- components/layout/theme-toggle.tsx       NEW  sun/moon light-dark toggle
- components/layout/site-footer.tsx        NEW  shared footer
- app/page.tsx, app/calculator/page.tsx    duplicate header/footer removed
- app/dashboard/page.tsx                   summary stats + cumulative GWA
- app/settings/page.tsx                    duplicate header removed
- app/not-found.tsx, app/error.tsx         NEW
- app/robots.ts, app/sitemap.ts            NEW

## Favicon / PWA icons
- public/favicon.ico, favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png,
  android-chrome-192x192.png, android-chrome-512x512.png   NEW (your icons)
- public/site.webmanifest                  NEW (name/short_name filled in, colours match the site)
- app/layout.tsx                           icons + manifest metadata (generates the <link> tags)
- middleware.ts                            skips .ico/.webmanifest so they don't trigger a session refresh

## SVG logo + favicon-green palette
- public/logo.svg                          NEW  your main.svg, optimized (58 KB -> 19 KB), cropped viewBox
- components/layout/site-header.tsx        header icon is now /logo.svg
- app/globals.css                          green palette (--ledger-*) retinted from teal to the favicon greens
