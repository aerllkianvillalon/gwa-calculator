"use client";

import { useState } from "react";
import Link from "next/link";
import type { GradingSystem, Subject } from "@/types/calculator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { stashPendingCalculation } from "@/lib/calculator/pending-calculation";

interface SaveGwaButtonProps {
  isAuthenticated: boolean;
  subjects: Subject[];
  gradingSystem: GradingSystem;
  gwa: number;
}

export function SaveGwaButton({
  isAuthenticated,
  subjects,
  gradingSystem,
  gwa,
}: SaveGwaButtonProps) {
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [name, setName] = useState("");
  const [semester, setSemester] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [schoolOrProgram, setSchoolOrProgram] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      const response = await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || undefined,
          gradingSystemId: gradingSystem.id,
          semester: semester || undefined,
          academicYear: academicYear || undefined,
          schoolOrProgram: schoolOrProgram || undefined,
          subjects: subjects.map((s) => ({
            id: s.id,
            name: s.name,
            units: s.units,
            grade: s.grade,
          })),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? "Couldn't save your GWA. Please try again.");
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
        Saved. View it any time from your{" "}
        <Link href="/dashboard" className="underline">
          dashboard
        </Link>
        .
      </Alert>
    );
  }

  if (showAuthPrompt) {
    return (
      <Card className="p-5">
        <p className="text-sm text-ink-700">
          Create a free account or log in to save this result. Your subjects and grades stay on
          this device until you do — nothing is sent to the server until you choose to save.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
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
      <Card className="p-5">
        <h3 className="font-serif text-base font-medium text-ink-900">Save this GWA</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Calculation name (optional)"
            placeholder="e.g. 1st Sem 2025-2026"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Semester (optional)"
            placeholder="e.g. 1st Semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          />
          <Input
            label="Academic year (optional)"
            placeholder="e.g. 2025-2026"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          />
          <Input
            label="School / program (optional)"
            placeholder="e.g. BS Computer Science"
            value={schoolOrProgram}
            onChange={(e) => setSchoolOrProgram(e.target.value)}
          />
        </div>
        {status === "error" && (
          <Alert tone="error" className="mt-3">
            {errorMessage}
          </Alert>
        )}
        <div className="mt-3 flex gap-2">
          <Button type="button" onClick={handleSave} isLoading={status === "saving"}>
            Save
          </Button>
          <Button type="button" variant="ghost" onClick={() => setShowSaveForm(false)}>
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Button type="button" variant="secondary" onClick={handleClick}>
      Save this GWA · {gwa.toFixed(2)}
    </Button>
  );
}
