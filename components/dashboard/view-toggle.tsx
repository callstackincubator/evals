"use client";

import { cn } from "@/lib/utils";

export type ViewMode = "chart" | "table" | "cost";

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

function CostViewIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M12 2C7.589 2 4 5.589 4 10C4 15.046 9.529 20.883 11.894 23.198L12 23.301L12.106 23.198C14.471 20.883 20 15.046 20 10C20 5.589 16.411 2 12 2ZM12 20.959C9.939 18.857 6 14.248 6 10C6 6.691 8.691 4 12 4C15.309 4 18 6.691 18 10C18 14.248 14.061 18.857 12 20.959ZM12.75 6H11.25V7H10V9H14C14.551 9 15 9.449 15 10C15 10.551 14.551 11 14 11H10V13H11.25V14H12.75V13H14C15.654 13 17 11.654 17 10C17 8.346 15.654 7 14 7H12.75V6ZM10 15V17H14V15H10Z" />
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
          "inline-flex h-10 flex-1 items-center justify-center gap-2 border-r border-zinc-800 text-sm font-medium transition-colors last:border-r-0",
          value === "table"
            ? "bg-zinc-100 text-zinc-900"
            : "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100",
        )}
      >
        <TableViewIcon />
        Table
      </button>

      <button
        type="button"
        onClick={() => onChange("cost")}
        aria-pressed={value === "cost"}
        className={cn(
          "inline-flex h-10 flex-1 items-center justify-center gap-2 text-sm font-medium transition-colors",
          value === "cost"
            ? "bg-zinc-100 text-zinc-900"
            : "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100",
        )}
      >
        <CostViewIcon />
        Cost
      </button>
    </div>
  );
}
