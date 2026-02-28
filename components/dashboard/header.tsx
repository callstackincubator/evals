"use client";

import { GithubLogo, WarningCircle } from "@phosphor-icons/react";
import { CallstackLogo } from "@/components/dashboard/callstack-logo";
import { NavigationCategories, type DashboardTabId } from "@/components/dashboard/nav-categories";
import type { CategoryDefinition } from "@/lib/types/evals";

interface DashboardHeaderProps {
  categories: CategoryDefinition[];
  activeTab: DashboardTabId;
  onTabChange: (tabId: DashboardTabId) => void;
  generatedAt: string;
  sourceRepoUrl: string;
  warningCount: number;
}

function formatGeneratedAt(generatedAt: string): string {
  const date = new Date(generatedAt);

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export function DashboardHeader({
  categories,
  activeTab,
  onTabChange,
  generatedAt,
  sourceRepoUrl,
  warningCount,
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-4 py-3 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <CallstackLogo className="h-5 text-zinc-300" />
          <NavigationCategories
            categories={categories}
            activeTab={activeTab}
            onTabChange={onTabChange}
          />
        </div>

        <div className="flex items-center gap-2 text-sm whitespace-nowrap">
          {warningCount > 0 && (
            <span className="inline-flex items-center gap-1 border border-amber-700 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-300">
              <WarningCircle size={13} />
              Warnings: {warningCount}
            </span>
          )}
          <span className="text-zinc-400">Generated: {formatGeneratedAt(generatedAt)}</span>
          <a
            href={sourceRepoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 border border-zinc-800 bg-zinc-900 px-3 font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          >
            <GithubLogo size={16} />
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
