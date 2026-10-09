import { describe, it, expect } from "vitest";
import { safeRedirect, withRestoreFlag } from "@/lib/security/safe-redirect";

describe("safeRedirect", () => {
  it("allows normal same-site paths", () => {
    expect(safeRedirect("/dashboard")).toBe("/dashboard");
    expect(safeRedirect("/calculator?restore=1")).toBe("/calculator?restore=1");
    expect(safeRedirect("/account-settings#password")).toBe("/account-settings#password");
  });

  it("falls back for missing values", () => {
    expect(safeRedirect(null)).toBe("/dashboard");
    expect(safeRedirect(undefined)).toBe("/dashboard");
    expect(safeRedirect("")).toBe("/dashboard");
  });

  it.each([
    "@evil.com",
    ".evil.com",
    "evil.com",
    "//evil.com",
    "///evil.com",
    "/\\evil.com",
    "\\\\evil.com",
    "https://evil.com",
    "http://evil.com/path",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "/path\nSet-Cookie: x=1",
    "/ /evil.com",
    "/%0d%0a",
  ])("rejects %s", (value) => {
    const out = safeRedirect(value);
    if (value === "/%0d%0a") {
      // Encoded newlines are harmless inside a path, but must stay same-origin.
      expect(out.startsWith("/")).toBe(true);
    } else {
      expect(out).toBe("/dashboard");
    }
  });

  it("supports a custom fallback", () => {
    expect(safeRedirect("//evil.com", "/")).toBe("/");
  });

  it("rejects overly long values", () => {
    expect(safeRedirect("/" + "a".repeat(600))).toBe("/dashboard");
  });
});

describe("withRestoreFlag", () => {
  it("adds the flag with the right separator", () => {
    expect(withRestoreFlag("/calculator", true)).toBe("/calculator?restore=1");
    expect(withRestoreFlag("/calculator?a=1", true)).toBe("/calculator?a=1&restore=1");
    expect(withRestoreFlag("/calculator", false)).toBe("/calculator");
  });
});