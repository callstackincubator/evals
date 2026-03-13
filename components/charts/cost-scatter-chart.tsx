"use client";

import {
  CartesianGrid,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";
import { ModelLogoSquare } from "@/components/tables/table-badges";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  buildCategoryCostScatterData,
  buildOverviewCostScatterData,
  type CostScatterPoint,
} from "@/lib/data/cost-chart";
import type { CategoryDefinition, ModelSummary } from "@/lib/types/evals";
import { formatPct, formatUsd, formatUsdPrecise } from "@/lib/utils";

const FRONTIER_POINT_COLOR = "#22c55e";
const FRONTIER_LINE_COLOR = "#3f6212";
const BELOW_FRONTIER_COLOR = "#b8b5ad";

interface CostScatterChartProps {
  models: ModelSummary[];
  category?: CategoryDefinition;
}

interface TooltipPayloadItem {
  payload?: CostScatterPoint;
}

interface CostPointShapeProps {
  cx?: number;
  cy?: number;
  payload?: CostScatterPoint;
  fill?: string;
}

function formatAxisCost(value: number): string {
  const fractionDigits = value < 2 ? 2 : value < 10 ? 1 : 0;

  return formatUsd(value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  });
}

function getNiceCostStep(maxCost: number): number {
  const targetStep = maxCost / 6;
  const candidateSteps = [
    0.05,
    0.1,
    0.25,
    0.5,
    1,
    2.5,
    5,
    10,
  ];

  for (const step of candidateSteps) {
    if (targetStep <= step) {
      return step;
    }
  }

  return 10;
}

function buildChartBounds(points: CostScatterPoint[], isOverview: boolean) {
  const costs = points.map((point) => point.costUsd);
  const maxCost = Math.max(...costs);
  const xStep = isOverview ? 5 : getNiceCostStep(maxCost);
  const xMax = isOverview
    ? Math.max(60, Math.ceil(maxCost / xStep) * xStep)
    : Math.max(xStep, Math.ceil(maxCost / xStep) * xStep);

  return {
    xDomain: [0, xMax] as [number, number],
    xTicks: Array.from({ length: Math.floor(xMax / xStep) + 1 }, (_, index) =>
      Number((index * xStep).toFixed(2)),
    ),
    yDomain: [0, 100] as [number, number],
  };
}

function CostPointShape({ cx, cy, payload, fill }: CostPointShapeProps) {
  if (typeof cx !== "number" || typeof cy !== "number" || !payload) {
    return null;
  }

  const labelY = payload.isOnFrontier ? cy - 14 : cy - 10;

  return (
    <g>
      <circle cx={cx} cy={cy} r={payload.isOnFrontier ? 11 : 9} fill={fill} />
      <text
        x={cx + 14}
        y={labelY}
        fill={fill}
        fontSize={12}
        fontWeight={500}
        className="pointer-events-none"
      >
        {payload.modelId}
      </text>
    </g>
  );
}

function CostScatterTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  const point = payload?.[0]?.payload;

  if (!active || !point) {
    return null;
  }

  return (
    <div className="tooltip-rounded min-w-56 overflow-hidden rounded border border-zinc-700 bg-zinc-950/95 px-5 py-4 shadow-xl">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <ModelLogoSquare modelId={point.modelId} modelLabel={point.modelLabel} />
          <p className="truncate text-xs font-semibold text-zinc-100">{point.modelLabel}</p>
        </div>
        <span className="text-[11px] font-medium text-zinc-400">
          {point.isOnFrontier ? "On frontier" : "Below frontier"}
        </span>
      </div>
      <div className="mt-3 space-y-1.5 border-t border-zinc-700 pt-3">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-zinc-300">Weighted average score</span>
          <span className="font-mono text-zinc-100">{formatPct(point.scorePct)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-zinc-300">Estimated cost</span>
          <span className="font-mono text-zinc-100">{formatUsdPrecise(point.costUsd)}</span>
        </div>
      </div>
    </div>
  );
}

function CostLegend({ unavailableLabels }: { unavailableLabels?: string[] }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-4 pb-4 text-sm text-zinc-200 md:px-0">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-3.5 w-3.5 rounded-full"
            style={{ backgroundColor: FRONTIER_POINT_COLOR }}
            aria-hidden
          />
          <span>On Pareto frontier (best value)</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-3.5 w-3.5 rounded-full"
            style={{ backgroundColor: BELOW_FRONTIER_COLOR }}
            aria-hidden
          />
          <span>Below frontier</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-0 w-10 border-t-2 border-dashed"
            style={{ borderColor: FRONTIER_LINE_COLOR }}
            aria-hidden
          />
          <span>Pareto frontier</span>
        </div>
      </div>

      {unavailableLabels && unavailableLabels.length > 0 ? (
        <p className="max-w-[32rem] text-right text-xs leading-5 text-zinc-400">
          Missing category cost:
          {" "}
          {unavailableLabels.join(", ")}
        </p>
      ) : null}
    </div>
  );
}

export function CostScatterChart({ models, category }: CostScatterChartProps) {
  const chartData = category
    ? buildCategoryCostScatterData(category, models)
    : buildOverviewCostScatterData(models);

  if (chartData.points.length === 0) {
    return (
      <div className="flex min-h-[600px] items-center justify-center border-y border-zinc-800 bg-zinc-950 px-6 text-sm text-zinc-400 lg:h-full lg:min-h-0 lg:border">
        No cost data is available for this view.
      </div>
    );
  }

  const frontierPoints = chartData.frontierPoints;
  const nonFrontierPoints = chartData.points.filter((point) => !point.isOnFrontier);
  const isOverview = !category;
  const { xDomain, xTicks, yDomain } = buildChartBounds(chartData.points, isOverview);
  const unavailableLabels = category
    ? models
      .filter((model) => chartData.omittedModelIds.includes(model.id))
      .map((model) => model.label)
    : [];

  return (
    <div className="flex h-auto min-h-[600px] flex-col border-y border-zinc-800 bg-zinc-950 p-0 lg:h-full lg:min-h-0 lg:border lg:p-4">
      <div className="shrink-0">
        <CostLegend unavailableLabels={unavailableLabels} />
      </div>

      <div className="min-h-[520px] w-full flex-1 lg:min-h-0">
        <ChartContainer
          className="h-full min-h-[520px] px-2 pt-4 md:px-0 lg:min-h-0"
          config={{
            frontier: { label: "On Pareto frontier", color: FRONTIER_POINT_COLOR },
            below: { label: "Below frontier", color: BELOW_FRONTIER_COLOR },
            frontierLine: { label: "Pareto frontier", color: FRONTIER_LINE_COLOR },
          }}
        >
          <ScatterChart margin={{ top: 12, right: 42, bottom: 56, left: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              type="number"
              dataKey="costUsd"
              name="Estimated cost"
              tickFormatter={formatAxisCost}
              domain={xDomain}
              ticks={xTicks}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              label={{
                value: "Estimated cost (USD)",
                position: "bottom",
                offset: 18,
                fill: "#71717a",
                fontSize: 12,
              }}
            />
            <YAxis
              type="number"
              dataKey="scorePct"
              name="Weighted average score"
              tickFormatter={(value) => `${value}%`}
              domain={yDomain}
              ticks={Array.from({ length: 11 }, (_, index) => index * 10).filter(
                (tick) => tick >= yDomain[0] && tick <= yDomain[1],
              )}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              width={52}
              label={{
                value: "Weighted average score",
                angle: -90,
                position: "insideLeft",
                fill: "#71717a",
                fontSize: 12,
              }}
            />
            <ChartTooltip
              cursor={{ stroke: "#3f3f46", strokeDasharray: "3 3" }}
              isAnimationActive={false}
              wrapperStyle={{ pointerEvents: "none" }}
              content={<CostScatterTooltip />}
            />
            <Scatter
              data={nonFrontierPoints}
              fill={BELOW_FRONTIER_COLOR}
              shape={<CostPointShape />}
              isAnimationActive={false}
            />
            <Scatter
              data={frontierPoints}
              fill={FRONTIER_POINT_COLOR}
              shape={<CostPointShape />}
              line={{
                stroke: FRONTIER_LINE_COLOR,
                strokeWidth: 1,
                strokeDasharray: "6 4",
              }}
              lineType="joint"
              isAnimationActive={false}
            />
          </ScatterChart>
        </ChartContainer>
      </div>

    </div>
  );
}
