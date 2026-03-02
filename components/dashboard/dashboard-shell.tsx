"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { ViewToggle, type ViewMode } from "@/components/dashboard/view-toggle";
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

export function DashboardShell({ data }: DashboardShellProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [viewMode, setViewMode] = useState<ViewMode>("chart");

  const activeCategory = useMemo(
    () => data.categories.find((category) => category.id === activeTab),
    [activeTab, data.categories],
  );

  const chartKey = `${activeTab}:${viewMode}`;

  return (
    <div className="flex h-screen min-h-[600px] flex-col bg-zinc-950 text-zinc-100">
      <DashboardHeader
        categories={data.categories}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        runStartedAt={data.runStartedAt}
        runFinishedAt={data.runFinishedAt}
        warningCount={data.warnings.length}
      />

      <div className="px-4 py-3 md:px-6">
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      <main className="min-h-0 flex-1 px-4 pb-4 md:px-6 md:pb-6">
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

        {activeCategory && viewMode === "chart" && (
          <CategoryBarChart key={chartKey} category={activeCategory} models={data.models} />
        )}

        {activeCategory && viewMode === "table" && (
          <CategoryDrilldownTable category={activeCategory} models={data.models} />
        )}
      </main>
    </div>
  );
}
