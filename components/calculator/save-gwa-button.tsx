"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import type { EditingCalculation, GradingSystem, Subject } from "@/types/calculator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { stashPendingCalculation } from "@/lib/calculator/pending-calculation";

interface SaveDetails {
  name: string;
  semester: string;
  academicYear: string;
  schoolOrProgram: string;
}

const EMPTY_DETAILS: SaveDetails = { name: "", semester: "", academicYear: "", schoolOrProgram: "" };

interface SaveGwaButtonProps {
  isAuthenticated: boolean;
  subjects: Subject[];
  gradingSystem: GradingSystem;
  gwa: number;
  /** When set, the button updates this saved calculation instead of creating a new one. */
  editing?: EditingCalculation;
}

function CardHeading({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ledger-100 text-ledger-900"
        aria-hidden="true"
      >
        <Bookmark className="h-5 w-5" />
      </span>
      <div>
        <h3 className="font-serif text-base font-medium text-ink-900">{title}</h3>
        {children && <p className="mt-1 text-sm text-ink-500">{children}</p>}
      </div>
    </div>
  );
}

export function SaveGwaButton({
  isAuthenticated,
  subjects,
  gradingSystem,
  gwa,
  editing,
}: SaveGwaButtonProps) {
  const isEditing = Boolean(editing);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [details, setDetails] = useState<SaveDetails>(
    editing
      ? {
          name: editing.name,
          semester: editing.semester,
          academicYear: editing.academicYear,
          schoolOrProgram: editing.schoolOrProgram,
        }
      : EMPTY_DETAILS
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function updateDetail(field: keyof SaveDetails, value: string) {
    setDetails((prev) => ({ ...prev, [field]: value }));
  }

  function handleClick() {
    if (!isAuthenticated) {
      stashPendingCalculation({ subjects, gradingSystemId: gradingSystem.id });
      setShowAuthPrompt(true);
      return;
    }
    setShowSaveForm(true);
  }

  async function handleSave() {
    setStatus("saving");
    setErrorMessage(null);
    try {
      const response = await fetch(
        editing ? `/api/calculations/${editing.id}` : "/api/calculations",
        {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: details.name || undefined,
          gradingSystemId: gradingSystem.id,
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
        throw new Error(
          body?.message ??
            (isEditing ? "Couldn't save your changes. Please try again." : "Couldn't save your GWA. Please try again.")
        );
      }

      setStatus("saved");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "saved") {
    return (
      <Alert tone="success">
        {isEditing ? "Updated." : "Saved."} View it any time from your{" "}
        <Link href="/dashboard" className="underline">
          dashboard
        </Link>
        .
      </Alert>
    );
  }

  if (showAuthPrompt) {
    return (
      <Card className="w-full p-5 sm:p-6">
        <CardHeading title="Save this result">
          Create a free account or log in to save it. Your subjects and grades stay on this device
          until you do — nothing is sent to the server until you choose to save.
        </CardHeading>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/login?redirect=/calculator&restore=1">
            <Button type="button" variant="primary" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/register?redirect=/calculator&restore=1">
            <Button type="button" variant="secondary" size="sm">
              Create account
            </Button>
          </Link>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowAuthPrompt(false)}>
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  if (showSaveForm) {
    return (
      <Card className="w-full p-5 sm:p-6">
        <CardHeading title={isEditing ? "Update this saved GWA" : "Save this GWA"}>
          {isEditing
            ? "This replaces the saved record with the subjects and grades above."
            : "Add optional details so it's easy to find on your dashboard later."}
        </CardHeading>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Calculation name (optional)"
            placeholder="e.g. 1st Sem 2025-2026"
            value={details.name}
            onChange={(e) => updateDetail("name", e.target.value)}
          />
          <Input
            label="Semester (optional)"
            placeholder="e.g. 1st Semester"
            value={details.semester}
            onChange={(e) => updateDetail("semester", e.target.value)}
          />
          <Input
            label="Academic year (optional)"
            placeholder="e.g. 2025-2026"
            value={details.academicYear}
            onChange={(e) => updateDetail("academicYear", e.target.value)}
          />
          <Input
            label="School / program (optional)"
            placeholder="e.g. BS Computer Science"
            value={details.schoolOrProgram}
            onChange={(e) => updateDetail("schoolOrProgram", e.target.value)}
          />
        </div>
        {status === "error" && (
          <Alert tone="error" className="mt-3">
            {errorMessage}
          </Alert>
        )}
        <div className="mt-4 flex gap-2">
          <Button type="button" onClick={handleSave} isLoading={status === "saving"}>
            {isEditing ? "Update" : "Save"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setShowSaveForm(false)}>
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Button type="button" variant="primary" onClick={handleClick} className="min-h-11 pl-4 pr-3">
      <Bookmark className="h-4 w-4" aria-hidden="true" />
      {isEditing ? "Update this saved GWA" : "Save this GWA"}
      <span className="ml-1 rounded bg-white/20 px-2 py-0.5 text-xs font-semibold tabular">
        {gwa.toFixed(2)}
      </span>
    </Button>
  );
}