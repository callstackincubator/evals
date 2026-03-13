"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    color?: string;
  }
>;

interface ChartContextValue {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a ChartContainer");
  }

  return context;
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorEntries = Object.entries(config).filter(([, value]) => value.color);

  if (colorEntries.length === 0) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: colorEntries
          .map(
            ([key, value]) =>
              `[data-chart="${id}"] { --color-${key}: ${value.color}; }`,
          )
          .join("\n"),
      }}
    />
  );
}

interface ChartContainerProps {
  config: ChartConfig;
  className?: string;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
}

export function ChartContainer({ config, className, children }: ChartContainerProps) {
  const chartId = React.useId().replace(/:/g, "");

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex h-full w-full justify-center text-xs",
          "[&_.recharts-cartesian-axis-tick_text]:fill-zinc-400",
          "[&_.recharts-cartesian-grid_line[stroke='#27272a']]:stroke-zinc-800",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-zinc-700",
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-layer]:outline-none",
          className,
        )}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export const ChartTooltip = RechartsPrimitive.Tooltip;

export function useChartConfig() {
  return useChart().config;
}
