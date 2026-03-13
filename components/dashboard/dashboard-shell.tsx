"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Info } from "@phosphor-icons/react";
import { DashboardHeader } from "@/components/dashboard/header";
import { ViewToggle, type ViewMode } from "@/components/dashboard/view-toggle";
import { CostScatterChart } from "@/components/charts/cost-scatter-chart";
import { CategoryDrilldownTable } from "@/components/tables/category-drilldown-table";
import { OverviewTable } from "@/components/tables/overview-table";
import type { DashboardData } from "@/lib/types/evals";

interface DashboardShellProps {
  data: DashboardData;
}

const OverviewStackedChart = dynamic(
  () =>
    import("@/components/charts/overview-stacked-chart").then(
      (module) => module.OverviewStackedChart,
    ),
  {
    ssr: false,
    loading: () => <div className="h-full min-h-[420px] border border-zinc-800 bg-zinc-950" />,
  },
);

const CategoryBarChart = dynamic(
  () =>
    import("@/components/charts/category-bar-chart").then(
      (module) => module.CategoryBarChart,
    ),
  {
    ssr: false,
    loading: () => <div className="h-full min-h-[420px] border border-zinc-800 bg-zinc-950" />,
  },
);

const EVALS_HEADLINE = "AI Agent Evaluations for React Native";
const EVALS_INFO_TEXT =
  "Performance results of AI coding agents on React Native code generation tasks, measuring success rate for common task groups, token usage, and cost.";

export function DashboardShell({ data }: DashboardShellProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [viewMode, setViewMode] = useState<ViewMode>("chart");

  const activeCategory = useMemo(
    () => data.categories.find((category) => category.id === activeTab),
    [activeTab, data.categories],
  );

  const chartKey = `${activeTab}:${viewMode}`;

  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col overflow-x-hidden bg-zinc-950 text-zinc-100 lg:h-screen lg:min-h-[600px]">
      <DashboardHeader
        categories={data.categories}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        runStartedAt={data.runStartedAt}
        runFinishedAt={data.runFinishedAt}
        runCount={data.runCount}
        warningCount={data.warnings.length}
      />

      <div className="px-4 py-3 md:px-6">
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      <main className="flex w-full min-w-0 flex-col px-0 pb-4 lg:min-h-0 lg:flex-1 lg:overflow-hidden md:px-6 md:pb-6">
        <div className="mb-3 flex items-center gap-2 px-4 md:px-0">
          <h2 className="text-base font-semibold tracking-[-0.04em] text-zinc-200 md:text-lg">
            {EVALS_HEADLINE}
          </h2>
          <div className="group relative">
            <button
              type="button"
              aria-label="More info about AI agent evaluations"
              aria-describedby="ai-agent-evals-tooltip"
              className="inline-flex h-5 w-5 items-center justify-center border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            >
              <Info size={12} weight="bold" />
            </button>

            <div
              id="ai-agent-evals-tooltip"
              role="tooltip"
              className="tooltip-rounded pointer-events-none absolute left-0 top-7 z-20 w-72 border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs leading-5 text-zinc-200 opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
            >
              {EVALS_INFO_TEXT}
            </div>
          </div>
        </div>

        <div className="min-h-0 lg:flex-1">
          {activeTab === "overview" && viewMode === "chart" && (
            <OverviewStackedChart
              key={chartKey}
              categories={data.categories}
              models={data.models}
            />
          )}

          {activeTab === "overview" && viewMode === "table" && (
            <OverviewTable categories={data.categories} models={data.models} />
          )}

          {activeTab === "overview" && viewMode === "cost" && (
            <CostScatterChart key={chartKey} models={data.models} />
          )}

          {activeCategory && viewMode === "chart" && (
            <CategoryBarChart key={chartKey} category={activeCategory} models={data.models} />
          )}

          {activeCategory && viewMode === "table" && (
            <CategoryDrilldownTable
              key={activeCategory.id}
              category={activeCategory}
              models={data.models}
              evalMatrixById={data.evalMatrixById}
            />
          )}

          {activeCategory && viewMode === "cost" && (
            <CostScatterChart key={chartKey} category={activeCategory} models={data.models} />
          )}
        </div>
      </main>
    </div>
  );
}
