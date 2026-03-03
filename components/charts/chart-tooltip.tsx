import { formatPct } from "@/lib/utils";

interface ChartTooltipRow {
  label: string;
  value: number;
  color: string;
}

interface ChartTooltipCardProps {
  title: string;
  subtitle?: string;
  rows: ChartTooltipRow[];
}

export function ChartTooltipCard({ title, subtitle, rows }: ChartTooltipCardProps) {
  return (
    <div
      className="tooltip-rounded min-w-56 overflow-hidden rounded border border-zinc-700 bg-zinc-950/95 px-5 py-4 shadow-xl"
      style={{ animation: "tooltip-fade-in 120ms ease-out", borderRadius: "4px", WebkitBorderRadius: "4px" }}
    >
      <p className="text-xs font-semibold text-zinc-100">{title}</p>
      {subtitle ? <p className="mt-0.5 text-[11px] text-zinc-400">{subtitle}</p> : null}
      <div className="mt-3 space-y-1.5 border-t border-zinc-700 pt-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="inline-flex w-4 justify-center">
                <span
                  className="tooltip-chip block h-4 w-2 rounded"
                  style={{ backgroundColor: row.color, borderRadius: "4px" }}
                />
              </span>
              <span>{row.label}</span>
            </div>
            <span className="font-mono text-zinc-100">{formatPct(row.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
