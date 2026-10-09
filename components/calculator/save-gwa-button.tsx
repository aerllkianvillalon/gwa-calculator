"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import type { EditingCalculation, GradingSystem, Subject } from "@/types/calculator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { PanelHeader } from "@/components/calculator/panel-header";
import { stashPendingCalculation } from "@/lib/calculator/pending-calculation";
import {
  EMPTY_SAVE_DETAILS,
  submitCalculation,
  type SaveDetails,
} from "@/lib/calculator/save-request";

interface SaveGwaButtonProps {
  isAuthenticated: boolean;
  subjects: Subject[];
  gradingSystem: GradingSystem;
  gwa: number;
  /** When set, the button updates this saved calculation instead of creating a new one. */
  editing?: EditingCalculation;
  /** Open the save form immediately (used after logging in mid-save). */
  startWithSaveForm?: boolean;
  /** Pre-filled details, e.g. ones typed before being asked to log in. */
  initialDetails?: SaveDetails;
  /** Called once the calculation has been saved or updated. */
  onSaved?: () => void;
}

export function SaveGwaButton({
  isAuthenticated,
  subjects,
  gradingSystem,
  gwa,
  editing,
  startWithSaveForm = false,
  initialDetails,
  onSaved,
}: SaveGwaButtonProps) {
  const isEditing = Boolean(editing);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(
    startWithSaveForm && isAuthenticated && !editing
  );
  const [details, setDetails] = useState<SaveDetails>(
    editing
      ? {
          name: editing.name,
          semester: editing.semester,
          academicYear: editing.academicYear,
          schoolOrProgram: editing.schoolOrProgram,
        }
      : initialDetails ?? EMPTY_SAVE_DETAILS
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function updateDetail(field: keyof SaveDetails, value: string) {
    setDetails((prev) => ({ ...prev, [field]: value }));
  }

  function handleClick() {
    if (!isAuthenticated) {
      stashPendingCalculation({
        subjects,
        gradingSystemId: gradingSystem.id,
        autoSave: true,
      });
      setShowAuthPrompt(true);
      return;
    }
    setShowSaveForm(true);
  }

  async function handleSave() {
    setStatus("saving");
    setErrorMessage(null);

    const result = await submitCalculation({
      editingId: editing?.id,
      gradingSystemId: gradingSystem.id,
      subjects,
      details,
      failureMessage: isEditing
        ? "Couldn't save your changes. Please try again."
        : "Couldn't save your GWA. Please try again.",
    });

    if (result.ok) {
      setStatus("saved");
      onSaved?.();
      return;
    }

    // Session expired (or never existed): instead of an error, invite them to
    // log in or register. The calculation and the details they typed are kept
    // and saved automatically as soon as they are signed in.
    if (result.status === 401 && !isEditing) {
      stashPendingCalculation({
        subjects,
        gradingSystemId: gradingSystem.id,
        details,
        autoSave: true,
      });
      setStatus("idle");
      setShowSaveForm(false);
      setShowAuthPrompt(true);
      return;
    }

    setStatus("error");
    setErrorMessage(result.message);
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
        <PanelHeader icon={Bookmark} headingLevel="h2" title="Want to save this result?">
          Log in or create an account to save your General Weighted Average.
          Until then, your subjects and grades stay on this device, and 
          nothing is sent to our server.
        </PanelHeader>
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
        <PanelHeader icon={Bookmark} headingLevel="h3" title={isEditing ? "Update this saved GWA" : "Save this GWA"}>
          {isEditing
            ? "This replaces the saved record with the subjects and grades above."
            : "Add optional details so it's easy to find on your dashboard later."}
        </PanelHeader>
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
    <Button type="button" variant="primary" onClick={handleClick} className="min-h-11 w-full py-3 pl-4 pr-3">
      <Bookmark className="h-4 w-4" aria-hidden="true" />
      {isEditing ? "Update this saved GWA" : "Save this GWA"}
      <span className="ml-1 rounded bg-white/20 px-2 py-0.5 text-xs font-semibold tabular">
        {gwa.toFixed(2)}
      </span>
    </Button>
  );
}