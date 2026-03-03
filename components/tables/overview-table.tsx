"use client";

import type { CategoryDefinition, ModelSummary } from "@/lib/types/evals";
import { cn, formatPct } from "@/lib/utils";
import { getPodiumRowStyle, ModelLogoSquare, RankBadge } from "@/components/tables/table-badges";

interface OverviewTableProps {
  categories: CategoryDefinition[];
  models: ModelSummary[];
}

function CountPill({ value, tone }: { value: number; tone: "pass" | "fail" }) {
  const pass = tone === "pass";

  return (
    <span
      className={cn(
        "inline-flex min-w-16 items-center justify-center border border-transparent px-2 py-1 font-mono text-xs font-medium",
        pass ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300",
      )}
    >
      {value}
    </span>
  );
}

export function OverviewTable({ categories, models }: OverviewTableProps) {
  return (
    <div className="no-scrollbar h-full overflow-auto border border-zinc-800 bg-zinc-950">
      <table className="min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-400">
            <th className="px-4 py-3 font-semibold">Model</th>
            <th className="px-4 py-3 text-center font-semibold">Overall</th>
            {categories.map((category) => (
              <th key={category.id} className="px-4 py-3 text-center font-semibold whitespace-nowrap">{category.name}</th>
            ))}
            <th className="px-4 py-3 text-center font-semibold">Passed</th>
            <th className="px-4 py-3 text-center font-semibold">Failed</th>
          </tr>
        </thead>

        <tbody>
          {models.map((model, index) => {
            const rank = index + 1;
            const isLast = index === models.length - 1;

            return (
            <tr
              key={model.id}
              className={cn(
                "border-b border-zinc-800/80 first:border-t-0 hover:bg-zinc-900/70",
                isLast && "border-b-0",
                rank <= 3 && "border-l-2",
              )}
              style={getPodiumRowStyle(rank)}
            >
              <td className="px-4 py-5 font-medium text-zinc-100">
                <div className="flex items-center gap-3">
                  <RankBadge rank={rank} />
                  <ModelLogoSquare modelId={model.id} modelLabel={model.label} />
                  <span>{model.label}</span>
                </div>
              </td>
              <td className="px-4 py-5 text-center font-mono text-zinc-300">
                {formatPct(model.overallScorePct)}
              </td>

              {categories.map((category) => {
                const score = model.categories[category.id]?.scorePct ?? 0;

                return (
                  <td key={`${model.id}-${category.id}`} className="px-4 py-5 text-center font-mono text-zinc-300 whitespace-nowrap">
                    {formatPct(score)}
                  </td>
                );
              })}
              <td className="px-4 py-5 text-center">
                <CountPill value={model.requirementsPassed} tone="pass" />
              </td>
              <td className="px-4 py-5 text-center">
                <CountPill value={model.requirementsTotal - model.requirementsPassed} tone="fail" />
              </td>
            </tr>
          );
          })}
        </tbody>
      </table>
    </div>
  );
}
