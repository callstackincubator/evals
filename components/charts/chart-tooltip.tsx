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
      className="min-w-56 border border-zinc-700 bg-zinc-950/95 px-3 py-2 shadow-xl"
      style={{ animation: "tooltip-fade-in 120ms ease-out" }}
    >
      <p className="text-xs font-semibold text-zinc-100">{title}</p>
      {subtitle ? <p className="mt-0.5 text-[11px] text-zinc-400">{subtitle}</p> : null}
      <div className="mt-2 space-y-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="h-2.5 w-2.5 border border-zinc-700" style={{ backgroundColor: row.color }} />
              <span>{row.label}</span>
            </div>
            <span className="font-mono text-zinc-100">{formatPct(row.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
