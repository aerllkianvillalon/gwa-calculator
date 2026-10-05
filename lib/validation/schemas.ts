import { z } from "zod";
import {
  MAX_SUBJECTS,
  MAX_SUBJECT_NAME_LENGTH,
  MAX_UNITS,
} from "@/lib/calculator/limits";

/**
 * Validation lives here so the exact same rules run in the browser (for fast
 * feedback) and on the server (which never trusts client-supplied numbers).
 */

export const subjectNameSchema = z
  .string()
  .trim()
  .min(1, "Subject name is required.")
  .max(MAX_SUBJECT_NAME_LENGTH, `Subject name is too long (${MAX_SUBJECT_NAME_LENGTH} characters max).`)
  // Strip anything that isn't plain text-ish; subject names are rendered as
  // text, never as HTML, but we still reject control characters up front.
  .regex(/^[^\u0000-\u001F\u007F]*$/, "Subject name contains invalid characters.");

export const unitsSchema = z.coerce
  .number({ invalid_type_error: "Units must be a number." })
  .finite("Units must be a finite number.")
  .positive("Units must be greater than zero.")
  .max(MAX_UNITS, `Units must be ${MAX_UNITS} or less.`);

export function gradeSchema(min: number, max: number) {
  return z.coerce
    .number({ invalid_type_error: "Grade must be a number." })
    .finite("Grade must be a finite number.")
    .min(min, `Grade must be at least ${min}.`)
    .max(max, `Grade must be at most ${max}.`);
}

export function subjectSchema(gradeMin: number, gradeMax: number) {
  return z.object({
    id: z.string().min(1),
    name: subjectNameSchema,
    units: unitsSchema,
    grade: gradeSchema(gradeMin, gradeMax),
  });
}

export function subjectsListSchema(gradeMin: number, gradeMax: number) {
  return z
    .array(subjectSchema(gradeMin, gradeMax))
    .min(1, "Add at least one subject.")
    .max(MAX_SUBJECTS, `You can calculate at most ${MAX_SUBJECTS} subjects at a time.`);
}

export const gradingSystemIdSchema = z.string().min(1).max(64);

/** Optional free-text field: trimmed, length-capped, and empty string -> undefined. */
function optionalText(maxLength: number, tooLongMessage?: string) {
  return z
    .string()
    .trim()
    .max(maxLength, tooLongMessage)
    .optional()
    .transform((v) => (v === "" ? undefined : v));
}

export const saveCalculationSchema = z.object({
  name: optionalText(120, "Name is too long (120 characters max)."),
  gradingSystemId: gradingSystemIdSchema,
  semester: optionalText(60),
  academicYear: optionalText(20),
  schoolOrProgram: optionalText(120),
  subjects: z
    .array(
      z.object({
        id: z.string().min(1),
        name: subjectNameSchema,
        units: unitsSchema,
        // Range is enforced by calculateGwa against the chosen grading system.
        grade: z.coerce.number().finite(),
      })
    )
    .min(1)
    .max(MAX_SUBJECTS),
});

export type SaveCalculationInput = z.infer<typeof saveCalculationSchema>;
