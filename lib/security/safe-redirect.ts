/**
 * Open-redirect protection.
 *
 * Only same-site, absolute-path redirects ("/dashboard", "/calculator?x=1") are
 * allowed. Anything that could be interpreted by a browser or by URL parsing as
 * a different origin ("//evil.com", "/\evil.com", "@evil.com", ".evil.com",
 * "https://evil.com", "javascript:...") falls back to a safe default.
 */
export const DEFAULT_REDIRECT = "/dashboard";

export function safeRedirect(value: string | null | undefined, fallback: string = DEFAULT_REDIRECT): string {
  if (!value || typeof value !== "string") return fallback;
  if (value.length > 512) return fallback;

  // Must be a root-relative path and not protocol-relative ("//host").
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;

  // Backslashes are treated as slashes by browsers ("/\evil.com").
  // Control characters / whitespace can be used to smuggle past naive checks.
  if (value.includes("\\") || /[\u0000-\u001F\u007F\s]/.test(value)) return fallback;

  // Final guard: resolve against a dummy origin and make sure it stays there.
  try {
    const base = "http://localhost";
    const resolved = new URL(value, base);
    if (resolved.origin !== base) return fallback;
    return resolved.pathname + resolved.search + resolved.hash;
  } catch {
    return fallback;
  }
}

/** Appends ?restore=1 (or &restore=1) when a guest draft should be restored. */
export function withRestoreFlag(path: string, restore: boolean): string {
  if (!restore) return path;
  return path + (path.includes("?") ? "&" : "?") + "restore=1";
}
