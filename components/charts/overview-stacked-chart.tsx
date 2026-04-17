"use client";

import { useState } from "react";
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
  highlightedCategoryId: string | null;
}

const CHART_BACKGROUND_COLOR = "#09090b";

function buildOverviewRows(categories: CategoryDefinition[], models: ModelSummary[]) {
  return models.map((model) => {
    const row: Record<string, number | string> = {
      model: model.label,
      modelId: model.id,
      overall: model.overallScorePct,
    };

    for (const category of categories) {
      row[category.id] = model.categories[category.id]?.contributionPct ?? 0;
    }

    return row;
  });
}

function OverviewTooltipContent({
  active,
  label,
  payload,
  categories,
  highlightedCategoryId,
}: OverviewTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0].payload ?? {};
  const modelId = String(row.modelId ?? "");
  const modelLabel = String(row.model ?? label ?? "");
  const overallScore = Number(row.overall ?? 0);

  const rows = categories.map((category) => {
    const value = Number(row[category.id] ?? 0);

    return {
      id: category.id,
      label: category.name,
      value,
      color: CATEGORY_COLORS[category.id] ?? "#71717a",
    };
  });

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
        <span className="font-mono text-xs text-zinc-100">{formatPct(overallScore)}</span>
      </div>
      <div className="mt-3 space-y-1.5 border-t border-zinc-700 pt-3">
        {rows.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-2 text-xs transition-opacity duration-300 ease-in-out"
            style={{
              opacity: highlightedCategoryId && highlightedCategoryId !== item.id ? 0.4 : 1,
            }}
          >
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="inline-flex w-4 justify-center">
                <span
                  className="tooltip-chip block h-4 w-2 rounded"
                  style={{ backgroundColor: item.color, borderRadius: "4px" }}
                />
              </span>
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
  const stackCategories = [...categories].reverse();
  const [highlightedCategoryId, setHighlightedCategoryId] = useState<string | null>(null);
  const mobileChartHeight = Math.max(440, rows.length * 50 + 72);

  return (
    <div className="h-auto min-h-[420px] border-y border-zinc-800 bg-zinc-950 p-0 lg:h-full lg:border lg:p-4">
      <div className="h-full lg:hidden" style={{ height: `${mobileChartHeight}px` }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={mobileChartHeight}>
          <BarChart
            data={rows}
            layout="vertical"
            barGap={8}
            barCategoryGap={12}
            margin={{ top: 8, right: 20, bottom: 0, left: 12 }}
            onMouseLeave={() => setHighlightedCategoryId(null)}
          >
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
              content={
                <OverviewTooltipContent
                  categories={categories}
                  highlightedCategoryId={highlightedCategoryId}
                />
              }
            />
            {stackCategories.map((category) => (
              <Bar
                key={`mobile-${category.id}`}
                dataKey={category.id}
                stackId="overall"
                fill={CATEGORY_COLORS[category.id] ?? "#71717a"}
                fillOpacity={
                  highlightedCategoryId && highlightedCategoryId !== category.id ? 0.6 : 1
                }
                stroke={CHART_BACKGROUND_COLOR}
                strokeWidth={2}
                radius={[0, 4, 4, 0]}
                style={{ transition: "fill-opacity 0.3s ease-in-out" }}
                onMouseEnter={() => setHighlightedCategoryId(category.id)}
                onMouseMove={() => setHighlightedCategoryId(category.id)}
                onMouseLeave={() => setHighlightedCategoryId(null)}
                name={category.name}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="hidden h-full lg:block">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
          <BarChart
            data={rows}
            barGap={8}
            barCategoryGap={16}
            onMouseLeave={() => setHighlightedCategoryId(null)}
          >
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
              content={
                <OverviewTooltipContent
                  categories={categories}
                  highlightedCategoryId={highlightedCategoryId}
                />
              }
            />
            {stackCategories.map((category) => (
              <Bar
                key={category.id}
                dataKey={category.id}
                stackId="overall"
                fill={CATEGORY_COLORS[category.id] ?? "#71717a"}
                fillOpacity={
                  highlightedCategoryId && highlightedCategoryId !== category.id ? 0.6 : 1
                }
                stroke={CHART_BACKGROUND_COLOR}
                strokeWidth={4}
                radius={4}
                style={{ transition: "fill-opacity 0.3s ease-in-out" }}
                onMouseEnter={() => setHighlightedCategoryId(category.id)}
                onMouseMove={() => setHighlightedCategoryId(category.id)}
                onMouseLeave={() => setHighlightedCategoryId(null)}
                name={category.name}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
