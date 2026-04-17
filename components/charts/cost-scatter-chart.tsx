"use client";

import type { MouseEvent } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";
import { ModelAxisTick } from "@/components/charts/model-axis-tick";
import { ModelLogoSquare } from "@/components/tables/table-badges";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  buildCategoryCostScatterData,
  buildOverviewCostScatterData,
  type CostScatterPoint,
} from "@/lib/data/cost-chart";
import type { CategoryDefinition, ModelSummary } from "@/lib/types/evals";
import { cn, formatPct, formatUsd, formatUsdPrecise } from "@/lib/utils";

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
  showLabel?: boolean;
  pointRadius?: number;
}

interface CostChartBounds {
  xDomain: [number, number];
  xTicks: number[];
  yDomain: [number, number];
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

function buildChartBounds(points: CostScatterPoint[], isOverview: boolean): CostChartBounds {
  const costs = points.map((point) => point.costUsd);
  const maxCost = Math.max(...costs);
  const xStep = isOverview ? 5 : getNiceCostStep(maxCost);
  const xMax = isOverview
    ? Math.max(60, Math.ceil(maxCost / xStep) * xStep)
    : Math.max(xStep, Math.ceil(maxCost / xStep) * xStep);

  return {
    xDomain: [0, xMax],
    xTicks: Array.from({ length: Math.floor(xMax / xStep) + 1 }, (_, index) =>
      Number((index * xStep).toFixed(2)),
    ),
    yDomain: [0, 100],
  };
}

function CostPointShape({
  cx,
  cy,
  payload,
  fill,
  showLabel = true,
  pointRadius,
}: CostPointShapeProps) {
  if (typeof cx !== "number" || typeof cy !== "number" || !payload) {
    return null;
  }

  const radius = pointRadius ?? (payload.isOnFrontier ? 7 : 6);
  const label = payload.modelId;
  const labelX = cx + radius + 6;
  const labelY = cy - radius - 4;
  const labelWidth = label.length * 7.25 + 10;
  const bringPointToFront = (event: MouseEvent<SVGGElement>) => {
    const symbol = event.currentTarget.closest(".recharts-scatter-symbol");
    symbol?.parentElement?.appendChild(symbol);

    const scatter = event.currentTarget.closest(".recharts-scatter");
    scatter?.parentElement?.appendChild(scatter);
  };

  return (
    <g onMouseEnter={bringPointToFront} style={{ cursor: "default" }}>
      <circle cx={cx} cy={cy} r={radius} fill={fill} />
      {showLabel ? (
        <g>
          <rect
            x={labelX - 5}
            y={labelY - 14}
            width={labelWidth}
            height={20}
            fill="#09090b"
            fillOpacity={0.96}
            style={{ filter: "drop-shadow(0 0 5px rgba(9, 9, 11, 0.95))" }}
          />
          <text
            x={labelX}
            y={labelY}
            fill="none"
            fontSize={12}
            fontWeight={500}
            stroke="#09090b"
            strokeLinejoin="round"
            strokeWidth={4}
            opacity={0.85}
            style={{ filter: "blur(0.6px)" }}
          >
            {label}
          </text>
          <text
            x={labelX}
            y={labelY}
            fill="none"
            fontSize={12}
            fontWeight={500}
            stroke="#09090b"
            strokeLinejoin="round"
            strokeWidth={2}
            opacity={0.95}
          >
            {label}
          </text>
          <text
            x={labelX}
            y={labelY}
            fill={fill}
            fontSize={12}
            fontWeight={500}
          >
            {label}
          </text>
        </g>
      ) : null}
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

function CostLegend({ unavailableLabels, stacked = false }: { unavailableLabels?: string[]; stacked?: boolean }) {
  return (
    <div
      className={cn(
        "px-4 pb-4 text-sm text-zinc-200 md:px-0",
        stacked
          ? "flex flex-col gap-3"
          : "flex flex-wrap items-start justify-between gap-x-6 gap-y-3",
      )}
    >
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
        <p className={cn("text-xs leading-5 text-zinc-400", stacked ? "text-left" : "max-w-[32rem] text-right")}>
          Missing category cost: {unavailableLabels.join(", ")}
        </p>
      ) : null}
    </div>
  );
}

function MobileCostBars({
  bounds,
  frontierPoints,
  nonFrontierPoints,
}: {
  bounds: CostChartBounds;
  frontierPoints: CostScatterPoint[];
  nonFrontierPoints: CostScatterPoint[];
}) {
  const rows = [...frontierPoints, ...nonFrontierPoints]
    .sort((left, right) => right.costUsd - left.costUsd || right.scorePct - left.scorePct)
    .map((point) => ({
      ...point,
      model: point.modelLabel,
      modelId: point.modelId,
      mobileCostUsd: point.costUsd,
    }));
  const modelIdByLabel = Object.fromEntries(rows.map((row) => [row.model, row.modelId]));
  const mobileChartHeight = Math.max(440, rows.length * 50 + 72);
  const mobileTicks = bounds.xTicks.filter((tick, index, ticks) => index % 2 === 0 || index === ticks.length - 1);

  return (
    <div className="lg:hidden">
      <div className="h-full" style={{ height: `${mobileChartHeight}px` }}>
        <ChartContainer
          className="h-full min-h-[420px] min-w-0"
          config={{
            frontier: { label: "On Pareto frontier", color: FRONTIER_POINT_COLOR },
            below: { label: "Below frontier", color: BELOW_FRONTIER_COLOR },
          }}
        >
          <BarChart
            data={rows}
            layout="vertical"
            barGap={8}
            barCategoryGap={12}
            margin={{ top: 8, right: 20, bottom: 0, left: 12 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
            <XAxis
              type="number"
              dataKey="mobileCostUsd"
              domain={bounds.xDomain}
              ticks={mobileTicks}
              tickFormatter={formatAxisCost}
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
            <ChartTooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              isAnimationActive={false}
              wrapperStyle={{ pointerEvents: "none" }}
              content={<CostScatterTooltip />}
            />
            <Bar dataKey="mobileCostUsd" name="Estimated cost" radius={[0, 4, 4, 0]}>
              {rows.map((row) => (
                <Cell
                  key={`mobile-cost-${row.modelId}`}
                  fill={row.isOnFrontier ? FRONTIER_POINT_COLOR : BELOW_FRONTIER_COLOR}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}

function DesktopCostScatter({
  bounds,
  frontierPoints,
  nonFrontierPoints,
}: {
  bounds: CostChartBounds;
  frontierPoints: CostScatterPoint[];
  nonFrontierPoints: CostScatterPoint[];
}) {
  return (
    <div className="hidden min-h-[600px] lg:block lg:h-full lg:min-h-0">
      <div className="h-[600px] w-full lg:h-full">
        <ChartContainer
          className="h-full min-h-[600px] px-2 pt-4 md:px-0 lg:min-h-0"
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
              domain={bounds.xDomain}
              ticks={bounds.xTicks}
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
              domain={bounds.yDomain}
              ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
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

export function CostScatterChart({ models, category }: CostScatterChartProps) {
  const chartData = category
    ? buildCategoryCostScatterData(category, models)
    : buildOverviewCostScatterData(models);

  if (chartData.points.length === 0) {
    return (
      <div className="flex min-h-[420px] items-center justify-center border-y border-zinc-800 bg-zinc-950 px-6 text-sm text-zinc-400 lg:h-full lg:min-h-0 lg:border">
        No cost data is available for this view.
      </div>
    );
  }

  const frontierPoints = chartData.frontierPoints;
  const nonFrontierPoints = chartData.points.filter((point) => !point.isOnFrontier);
  const isOverview = !category;
  const bounds = buildChartBounds(chartData.points, isOverview);
  const unavailableLabels = category
    ? models
      .filter((model) => chartData.omittedModelIds.includes(model.id))
      .map((model) => model.label)
    : [];

  return (
    <div className="flex min-h-[420px] flex-col border-y border-zinc-800 bg-zinc-950 p-0 lg:h-full lg:min-h-0 lg:border lg:p-4">
      <div className="shrink-0">
        <div className="hidden lg:block">
          <CostLegend unavailableLabels={unavailableLabels} />
        </div>
      </div>

      <MobileCostBars
        bounds={bounds}
        frontierPoints={frontierPoints}
        nonFrontierPoints={nonFrontierPoints}
      />

      <DesktopCostScatter
        bounds={bounds}
        frontierPoints={frontierPoints}
        nonFrontierPoints={nonFrontierPoints}
      />
    </div>
  );
}
