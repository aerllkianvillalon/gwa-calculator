import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CalculatorApp } from "@/components/calculator/calculator-app";
import { getCurrentUser } from "@/lib/supabase/get-user";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation/uuid";
import type { SavedCalculationRow } from "@/types/database";
import type { EditingCalculation } from "@/types/calculator";

export const metadata: Metadata = {
  title: "GWA Calculator",
  description: "Calculate your General Weighted Average as a guest, no account required.",
  alternates: { canonical: "/calculator" },
};

export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string | string[] }>;
}) {
  const { edit } = await searchParams;
  const editId = typeof edit === "string" && isUuid(edit) ? edit : null;
  const user = await getCurrentUser();

  // ?edit=<id> loads one of the signed-in person's saved calculations for editing.
  let editing: EditingCalculation | null = null;
  if (editId) {
    if (!user) {
      redirect(`/login?redirect=${encodeURIComponent(`/calculator?edit=${editId}`)}`);
    }
    const supabase = await createClient();
    const { data } = await supabase
      .from("saved_calculations")
      .select("*")
      .eq("id", editId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!data) notFound();
    const row = data as SavedCalculationRow;
    editing = {
      id: row.id,
      name: row.name ?? "",
      semester: row.semester ?? "",
      academicYear: row.academic_year ?? "",
      schoolOrProgram: row.school_or_program ?? "",
      gradingSystemId: row.grading_system_id,
      subjects: row.subjects,
    };
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <section className="mb-8">
        <h1 className="font-serif text-3xl font-medium leading-tight text-ink-900 sm:text-4xl">
          {editing ? "Edit saved GWA" : "Calculate your General Weighted Average"}
        </h1>
        <p className="mt-3 max-w-xl text-ink-700">
          {editing
            ? "Change subjects, units or grades, press Calculate GWA, then update your saved record."
            : "Add your subjects, units, and grades below to get your GWA right away. Built with the Philippine 1.00–5.00 numeric scale in mind, with other grading scales available if your school uses one of those instead."}
        </p>
      </section>
      <CalculatorApp
        key={editing?.id ?? "new"}
        isAuthenticated={Boolean(user)}
        editing={editing ?? undefined}
      />
    </main>
  );
}
