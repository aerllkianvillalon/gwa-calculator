import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "error" | "warning";

const toneClasses: Record<Tone, string> = {
  info: "border-ink-100 bg-white text-ink-700",
  success: "border-ledger-300 bg-ledger-100 text-ledger-900",
  error: "border-danger-100 bg-danger-100 text-danger-600",
  warning: "border-danger-100 bg-danger-100 text-danger-600",
};

const tonePrefix: Record<Tone, string> = {
  info: "Note:",
  success: "Success:",
  error: "Error:",
  warning: "Warning:",
};

export function Alert({
  tone = "info",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        toneClasses[tone],
        className
      )}
    >
      <span className="font-semibold">{tonePrefix[tone]}</span>{" "}
      <span>{children}</span>
    </div>
  );
}