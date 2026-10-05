import { z } from "zod";
import type { Subject } from "@/types/calculator";
import { MAX_SUBJECTS, MAX_SUBJECT_NAME_LENGTH } from "@/lib/calculator/limits";

const STORAGE_KEY = "gwa:pending-calculation";

export interface PendingCalculation {
  subjects: Subject[];
  gradingSystemId: string;
}

// sessionStorage can be edited by the user (or by a script on the page), so
// treat whatever comes back as untrusted input and validate its shape.
const pendingSchema = z.object({
  gradingSystemId: z.string().min(1).max(64),
  subjects: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        name: z.string().max(MAX_SUBJECT_NAME_LENGTH),
        units: z.number().finite(),
        grade: z.number().finite(),
      })
    )
    .max(MAX_SUBJECTS),
});

/**
 * Guest calculations never leave the device unless the user chooses to save.
 * This only ever touches sessionStorage (cleared when the tab closes) and is
 * used purely to carry a draft across the login/register redirect — it is
 * never sent anywhere automatically.
 */
export function stashPendingCalculation(data: PendingCalculation): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage can fail in private browsing modes; saving is best-effort.
  }
}

export function readPendingCalculation(): PendingCalculation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = pendingSchema.safeParse(JSON.parse(raw));
    return parsed.success ? (parsed.data as PendingCalculation) : null;
  } catch {
    return null;
  }
}

export function clearPendingCalculation(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
