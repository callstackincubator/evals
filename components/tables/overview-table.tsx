"use client";

import type { CategoryDefinition, ModelSummary } from "@/lib/types/evals";
import { cn, formatNumber, formatPct } from "@/lib/utils";
import { getPodiumRowStyle, ModelLogoSquare, RankBadge } from "@/components/tables/table-badges";

interface OverviewTableProps {
  categories: CategoryDefinition[];
  models: ModelSummary[];
}

export function OverviewTable({ categories, models }: OverviewTableProps) {
  return (
    <div className="no-scrollbar overflow-x-auto overflow-y-visible border-y border-zinc-800 bg-zinc-950 lg:h-full lg:overflow-auto lg:border">
      <table className="min-w-full w-max border-collapse text-sm">
        <colgroup>
          <col className="w-[18rem] sm:w-[22rem]" />
          <col className="w-[8rem]" />
          {categories.map((category) => (
            <col key={category.id} className="w-[8rem]" />
          ))}
          <col className="w-[10rem]" />
        </colgroup>
        <thead className="sticky top-0 z-10 bg-background">
          <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-400">
            <th className="px-4 py-3 font-semibold">Model</th>
            <th className="px-4 py-3 text-center font-semibold">Overall</th>
            {categories.map((category) => (
              <th key={category.id} className="px-4 py-3 text-center font-semibold whitespace-nowrap">{category.name}</th>
            ))}
            <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Tokens Used</th>
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
                <td className="px-4 py-5 font-medium whitespace-nowrap text-zinc-100">
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

                <td className="px-4 py-5 text-center font-mono text-zinc-300 whitespace-nowrap">
                  {formatNumber(model.tokensUsed)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
