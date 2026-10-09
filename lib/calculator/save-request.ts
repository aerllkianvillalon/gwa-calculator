import type { Subject } from "@/types/calculator";

export interface SaveDetails {
  name: string;
  semester: string;
  academicYear: string;
  schoolOrProgram: string;
}

export const EMPTY_SAVE_DETAILS: SaveDetails = {
  name: "",
  semester: "",
  academicYear: "",
  schoolOrProgram: "",
};

export type SaveResult =
  | { ok: true }
  | { ok: false; status: number | null; message: string };

/**
 * Creates (POST) or updates (PATCH) a saved calculation. Shared by the Save
 * button and the "auto-save after login" step so both build the same request.
 */
export async function submitCalculation(args: {
  editingId?: string;
  gradingSystemId: string;
  subjects: Subject[];
  details: SaveDetails;
  failureMessage: string;
}): Promise<SaveResult> {
  const { editingId, gradingSystemId, subjects, details, failureMessage } = args;
  try {
    const response = await fetch(
      editingId ? `/api/calculations/${editingId}` : "/api/calculations",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: details.name || undefined,
          gradingSystemId,
          semester: details.semester || undefined,
          academicYear: details.academicYear || undefined,
          schoolOrProgram: details.schoolOrProgram || undefined,
          subjects: subjects.map((s) => ({
            id: s.id,
            name: s.name,
            units: s.units,
            grade: s.grade,
          })),
        }),
      }
    );

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      return { ok: false, status: response.status, message: body?.message ?? failureMessage };
    }
    return { ok: true };
  } catch {
    return { ok: false, status: null, message: failureMessage };
  }
}