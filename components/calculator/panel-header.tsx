import type { LucideIcon } from "lucide-react";

/** Icon tile + heading + blurb shared by the calculator's side panels. */
export function PanelHeader({
  icon: Icon,
  title,
  headingLevel: Heading = "h2",
  children,
}: {
  icon: LucideIcon;
  title: string;
  headingLevel?: "h2" | "h3";
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ledger-100 text-ledger-900"
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <Heading
          className={`font-serif font-medium text-ink-900 ${Heading === "h2" ? "text-lg" : "text-base"}`}
        >
          {title}
        </Heading>
        {children && <p className="mt-1 text-sm text-ink-500">{children}</p>}
      </div>
    </div>
  );
}
