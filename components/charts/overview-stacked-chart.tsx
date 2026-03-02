"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
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

interface OverviewStackedChartProps {
  categories: CategoryDefinition[];
  models: ModelSummary[];
}

interface TooltipPayloadItem {
  payload?: Record<string, string | number>;
}

interface OverviewTooltipProps {
  active?: boolean;
  label?: string;
  payload?: TooltipPayloadItem[];
  categories: CategoryDefinition[];
}

function buildOverviewRows(categories: CategoryDefinition[], models: ModelSummary[]) {
  return models.map((model) => {
    const row: Record<string, number | string> = {
      model: model.label,
      modelId: model.id,
      overall: model.overallScorePct,
    };
    const totalWeight = Object.values(model.categories).reduce(
      (acc, categoryScore) => acc + categoryScore.totalWeight,
      0,
    );

    for (const category of categories) {
      const passedWeight = model.categories[category.id]?.passedWeight ?? 0;
      row[category.id] = totalWeight > 0 ? (passedWeight / totalWeight) * 100 : 0;
    }

    return row;
  });
}

function OverviewTooltipContent({ active, label, payload, categories }: OverviewTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0].payload ?? {};
  const modelId = String(row.modelId ?? "");
  const modelLabel = String(label ?? "");
  const overallScore = Number(row.overall ?? 0);

  const rows = categories.map((category) => {
    const value = Number(row[category.id] ?? 0);

    return {
      label: category.name,
      value,
      color: CATEGORY_COLORS[category.id] ?? "#71717a",
    };
  });

  return (
    <div
      className="min-w-56 border border-zinc-700 bg-zinc-950/95 px-3 py-2 shadow-xl"
      style={{ animation: "tooltip-fade-in 120ms ease-out" }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <ModelLogoSquare modelId={modelId} modelLabel={modelLabel} />
          <p className="truncate text-xs font-semibold text-zinc-100">{modelLabel}</p>
        </div>
        <span className="font-mono text-xs text-zinc-100">{formatPct(overallScore)}</span>
      </div>
      <div className="mt-2 space-y-1.5">
        {rows.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="h-2.5 w-2.5 border border-zinc-700" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
            </div>
            <span className="font-mono text-zinc-100">{formatPct(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OverviewStackedChart({ categories, models }: OverviewStackedChartProps) {
  const rows = buildOverviewRows(categories, models);
  const modelIdByLabel = Object.fromEntries(models.map((model) => [model.label, model.id]));

  return (
    <div className="h-full min-h-[420px] border border-zinc-800 bg-zinc-950 p-4">
      <div className="h-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
          <BarChart data={rows} barGap={8} barCategoryGap={16}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
            <XAxis
              dataKey="model"
              tickLine={false}
              axisLine={false}
              interval={0}
              height={56}
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
              wrapperStyle={{ pointerEvents: "none" }}
              content={<OverviewTooltipContent categories={categories} />}
            />
            {categories.map((category) => (
              <Bar
                key={category.id}
                dataKey={category.id}
                stackId="overall"
                fill={CATEGORY_COLORS[category.id] ?? "#71717a"}
                name={category.name}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
