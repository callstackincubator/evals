"use client";

import type { CategoryDefinition, ModelSummary } from "@/lib/types/evals";
import { cn, formatPct } from "@/lib/utils";
import {
  DeltaBadge,
  getPodiumRowStyle,
  ModelLogoSquare,
  RankBadge,
} from "@/components/tables/table-badges";

interface OverviewTableProps {
  categories: CategoryDefinition[];
  models: ModelSummary[];
}

export function OverviewTable({ categories, models }: OverviewTableProps) {
  return (
    <div className="no-scrollbar h-full overflow-auto border border-zinc-800 bg-zinc-950">
      <table className="min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-zinc-900/95">
          <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-400">
            <th className="px-4 py-3 font-semibold">Model</th>
            <th className="px-4 py-3 font-semibold">Overall (V/C)</th>
            <th className="px-4 py-3 font-semibold">Delta</th>
            {categories.map((category) => (
              <th key={category.id} className="px-4 py-3 font-semibold whitespace-nowrap">
                {category.name} (V/C)
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {models.map((model, index) => {
            const rank = index + 1;

            return (
            <tr
              key={model.id}
              className={cn(
                "border-b border-zinc-800/80 hover:bg-zinc-900/70",
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
              <td className="px-4 py-5 text-zinc-300">
                {formatPct(model.variants.vanilla.overallScorePct)} / {" "}
                {formatPct(model.variants.callstack.overallScorePct)}
              </td>
              <td className="px-4 py-5">
                <DeltaBadge value={model.deltaOverallPct} />
              </td>

              {categories.map((category) => {
                const vanilla = model.variants.vanilla.categories[category.id].scorePct;
                const callstack = model.variants.callstack.categories[category.id].scorePct;

                return (
                  <td key={`${model.id}-${category.id}`} className="px-4 py-5 text-zinc-300 whitespace-nowrap">
                    {formatPct(vanilla)} / {formatPct(callstack)}
                  </td>
                );
              })}
            </tr>
          );
          })}
        </tbody>
      </table>
    </div>
  );
}
