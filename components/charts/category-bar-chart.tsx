"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltipCard } from "@/components/charts/chart-tooltip";
import { CATEGORY_COLORS } from "@/lib/colors/category-colors";
import type { CategoryDefinition, ModelSummary } from "@/lib/types/evals";

interface CategoryBarChartProps {
  category: CategoryDefinition;
  models: ModelSummary[];
}

interface TooltipPayloadItem {
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

  return (
    <ChartTooltipCard
      title={String(label ?? "")}
      rows={payload.map((entry) => ({
        label: String(entry.name ?? ""),
        value: Number(entry.value ?? 0),
        color: entry.color ?? "#71717a",
      }))}
    />
  );
}

export function CategoryBarChart({ category, models }: CategoryBarChartProps) {
  const rows = models
    .map((model) => ({
      model: model.label,
      vanilla: model.variants.vanilla.categories[category.id].scorePct,
      callstack: model.variants.callstack.categories[category.id].scorePct,
    }))
    .sort((left, right) => Math.max(right.vanilla, right.callstack) - Math.max(left.vanilla, left.callstack));
  const baseColor = CATEGORY_COLORS[category.id] ?? "#71717a";
  const allScores = rows.flatMap((row) => [row.vanilla, row.callstack]);
  const minScore = Math.min(...allScores);
  const maxScore = Math.max(...allScores);

  const opacityForScore = (score: number) => {
    if (maxScore === minScore) {
      return 1;
    }

    const normalized = (score - minScore) / (maxScore - minScore);
    return 0.35 + normalized * 0.65;
  };

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
              isAnimationActive={false}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              wrapperStyle={{ pointerEvents: "none" }}
              content={<CategoryTooltipContent />}
            />
            <Legend wrapperStyle={{ color: "#d4d4d8" }} />
            <Bar dataKey="vanilla" fill={baseColor} name="Vanilla">
              {rows.map((row) => (
                <Cell
                  key={`vanilla-${row.model}`}
                  fill={baseColor}
                  fillOpacity={opacityForScore(row.vanilla) * 0.85}
                />
              ))}
            </Bar>
            <Bar dataKey="callstack" fill={baseColor} name="Callstack">
              {rows.map((row) => (
                <Cell
                  key={`callstack-${row.model}`}
                  fill={baseColor}
                  fillOpacity={opacityForScore(row.callstack)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
