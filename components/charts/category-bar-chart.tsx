"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ModelAxisTick } from "@/components/charts/model-axis-tick";
import { ModelLogoSquare } from "@/components/tables/table-badges";
import { CATEGORY_COLORS } from "@/lib/colors/category-colors";
import { formatPct } from "@/lib/utils";
import type { CategoryDefinition, ModelSummary } from "@/lib/types/evals";

interface CategoryBarChartProps {
  category: CategoryDefinition;
  models: ModelSummary[];
}

interface TooltipPayloadItem {
  payload?: Record<string, string | number>;
  name?: string;
  value?: number | string;
  color?: string;
}

interface CategoryTooltipProps {
  active?: boolean;
  label?: string;
  payload?: TooltipPayloadItem[];
}

function CategoryTooltipContent({ active, label, payload }: CategoryTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0].payload ?? {};
  const modelId = String(row.modelId ?? "");
  const modelLabel = String(label ?? "");
  const score = Number(row.score ?? 0);

  return (
    <div
      className="tooltip-rounded min-w-56 overflow-hidden rounded border border-zinc-700 bg-zinc-950/95 px-5 py-4 shadow-xl"
      style={{ animation: "tooltip-fade-in 120ms ease-out", borderRadius: "4px", WebkitBorderRadius: "4px" }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <ModelLogoSquare modelId={modelId} modelLabel={modelLabel} />
          <p className="truncate text-xs font-semibold text-zinc-100">{modelLabel}</p>
        </div>
        <span className="font-mono text-xs text-zinc-100">{formatPct(score)}</span>
      </div>
    </div>
  );
}

export function CategoryBarChart({ category, models }: CategoryBarChartProps) {
  const rows = models
    .map((model) => ({
      modelId: model.id,
      model: model.label,
      score: model.categories[category.id]?.scorePct ?? 0,
    }))
    .sort((left, right) => right.score - left.score);
  const modelIdByLabel = Object.fromEntries(models.map((model) => [model.label, model.id]));
  const baseColor = CATEGORY_COLORS[category.id] ?? "#71717a";
  const minScore = rows.length > 0 ? Math.min(...rows.map((row) => row.score)) : 0;
  const maxScore = rows.length > 0 ? Math.max(...rows.map((row) => row.score)) : 100;
  const mobileChartHeight = Math.max(440, rows.length * 50 + 72);

  const opacityForScore = (score: number) => {
    if (maxScore === minScore) {
      return 1;
    }

    const normalized = (score - minScore) / (maxScore - minScore);
    return 0.35 + normalized * 0.65;
  };

  return (
    <div className="h-auto min-h-[420px] border-y border-zinc-800 bg-zinc-950 p-0 lg:h-full lg:border lg:p-4">
      <div className="h-full lg:hidden" style={{ height: `${mobileChartHeight}px` }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={mobileChartHeight}>
          <BarChart data={rows} layout="vertical" barGap={8} barCategoryGap={12} margin={{ top: 8, right: 20, bottom: 0, left: 12 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickCount={6}
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
            />
            <YAxis
              dataKey="model"
              type="category"
              tickLine={false}
              axisLine={false}
              width={156}
              tick={<ModelAxisTick modelIdByLabel={modelIdByLabel} orientation="y" align="left" labelWidth={152} />}
            />
            <Tooltip
              isAnimationActive={false}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              wrapperStyle={{ pointerEvents: "none", borderRadius: "4px", WebkitBorderRadius: "4px", overflow: "hidden" }}
              content={<CategoryTooltipContent />}
            />
            <Bar dataKey="score" fill={baseColor} name="Score" radius={[0, 4, 4, 0]}>
              {rows.map((row) => (
                <Cell
                  key={`score-mobile-${row.model}`}
                  fill={baseColor}
                  fillOpacity={opacityForScore(row.score)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="hidden h-full lg:block">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
          <BarChart data={rows} barGap={8} barCategoryGap={16}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
            <XAxis
              dataKey="model"
              tickLine={false}
              axisLine={false}
              interval={0}
              height={78}
              tick={<ModelAxisTick modelIdByLabel={modelIdByLabel} />}
            />
            <YAxis
              domain={[0, 100]}
              tickCount={11}
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
              axisLine={false}
              width={44}
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
            />
            <Tooltip
              isAnimationActive={false}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              wrapperStyle={{ pointerEvents: "none", borderRadius: "4px", WebkitBorderRadius: "4px", overflow: "hidden" }}
              content={<CategoryTooltipContent />}
            />
            <Bar dataKey="score" fill={baseColor} name="Score">
              {rows.map((row) => (
                <Cell
                  key={`score-${row.model}`}
                  fill={baseColor}
                  fillOpacity={opacityForScore(row.score)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
