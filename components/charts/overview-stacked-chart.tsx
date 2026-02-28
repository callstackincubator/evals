"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltipCard } from "@/components/charts/chart-tooltip";
import { CATEGORY_COLORS } from "@/lib/colors/category-colors";
import type { CategoryDefinition, ModelSummary } from "@/lib/types/evals";

interface OverviewStackedChartProps {
  categories: CategoryDefinition[];
  models: ModelSummary[];
}

interface TooltipPayloadItem {
  dataKey?: string;
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
    };

    for (const category of categories) {
      row[`vanilla_${category.id}`] = model.variants.vanilla.categories[category.id].scorePct;
      row[`callstack_${category.id}`] = model.variants.callstack.categories[category.id].scorePct;
    }

    return row;
  });
}

function OverviewTooltipContent({ active, label, payload, categories }: OverviewTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const firstEntry = payload[0];
  const dataKey = String(firstEntry.dataKey ?? "");
  const variant = dataKey.startsWith("callstack_") ? "callstack" : "vanilla";
  const row = firstEntry.payload ?? {};

  const rows = categories.map((category) => {
    const value = Number(row[`${variant}_${category.id}`] ?? 0);

    return {
      label: category.name,
      value,
      color: CATEGORY_COLORS[category.id] ?? "#71717a",
    };
  });

  return (
    <ChartTooltipCard
      title={`${String(label ?? "")} - ${variant === "callstack" ? "Callstack" : "Vanilla"}`}
      rows={rows}
    />
  );
}

export function OverviewStackedChart({ categories, models }: OverviewStackedChartProps) {
  const rows = buildOverviewRows(categories, models);

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
              height={42}
              tick={{ fill: "#a1a1aa", fontSize: 14 }}
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
              shared={false}
              isAnimationActive={false}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              wrapperStyle={{ pointerEvents: "none" }}
              content={<OverviewTooltipContent categories={categories} />}
            />
            <Legend wrapperStyle={{ color: "#d4d4d8" }} />

            {categories.map((category) => (
              <Bar
                key={`vanilla_${category.id}`}
                dataKey={`vanilla_${category.id}`}
                stackId="vanilla"
                fill={CATEGORY_COLORS[category.id] ?? "#71717a"}
                name={`${category.name} (vanilla)`}
                radius={[0, 0, 0, 0]}
              />
            ))}

            {categories.map((category) => (
              <Bar
                key={`callstack_${category.id}`}
                dataKey={`callstack_${category.id}`}
                stackId="callstack"
                fill={CATEGORY_COLORS[category.id] ?? "#71717a"}
                fillOpacity={0.45}
                name={`${category.name} (callstack)`}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
