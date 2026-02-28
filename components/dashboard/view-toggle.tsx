"use client";

import { cn } from "@/lib/utils";

export type ViewMode = "chart" | "table";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

function ChartViewIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M21 21H3V3H21V21ZM5 19H19V5H5V19ZM9 17H7V11H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" />
    </svg>
  );
}

function TableViewIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 4H22V20H2V4ZM4 6V10H20V6H4ZM20 12H10V14H20V12ZM20 16H16V18H20V16ZM14 18V16H4V18H14ZM4 14H8V12H4V14Z"
      />
    </svg>
  );
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div role="group" aria-label="View mode" className="inline-flex w-full border border-zinc-800 bg-zinc-950">
      <button
        type="button"
        onClick={() => onChange("chart")}
        aria-pressed={value === "chart"}
        className={cn(
          "inline-flex h-10 flex-1 items-center justify-center gap-2 border-r border-zinc-800 text-sm font-medium transition-colors",
          value === "chart"
            ? "bg-zinc-100 text-zinc-900"
            : "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100",
        )}
      >
        <ChartViewIcon />
        Chart
      </button>

      <button
        type="button"
        onClick={() => onChange("table")}
        aria-pressed={value === "table"}
        className={cn(
          "inline-flex h-10 flex-1 items-center justify-center gap-2 text-sm font-medium transition-colors",
          value === "table"
            ? "bg-zinc-100 text-zinc-900"
            : "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100",
        )}
      >
        <TableViewIcon />
        Table
      </button>
    </div>
  );
}
