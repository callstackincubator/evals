"use client";

import { WarningCircle } from "@phosphor-icons/react";
import { CallstackLogo } from "@/components/dashboard/callstack-logo";
import { NavigationCategories, type DashboardTabId } from "@/components/dashboard/nav-categories";
import type { CategoryDefinition } from "@/lib/types/evals";

const RESULTS_REPO_URL = "https://github.com/callstack/rn-evals-results";

interface DashboardHeaderProps {
  categories: CategoryDefinition[];
  activeTab: DashboardTabId;
  onTabChange: (tabId: DashboardTabId) => void;
  runStartedAt: string;
  runFinishedAt: string;
  runCount: number;
  warningCount: number;
}

function formatDate(dateValue: string): string {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function DashboardHeader({
  categories,
  activeTab,
  onTabChange,
  runStartedAt,
  runFinishedAt,
  runCount,
  warningCount,
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-4 py-3 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <CallstackLogo className="h-5 text-white" />
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
          <span className="text-zinc-400">
            Last run: {formatDate(runFinishedAt || runStartedAt)} · {runCount}x Runs
          </span>
          <a
            href={RESULTS_REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="ml-4 inline-flex h-9 items-center gap-2 border border-zinc-100 bg-zinc-100 px-3 font-medium text-zinc-900 transition-colors hover:bg-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 2H9V4H7V6H5V2Z" fill="currentColor" />
              <path d="M5 12H3V6H5V12Z" fill="currentColor" />
              <path d="M7 14H5V12H7V14Z" fill="currentColor" />
              <path fillRule="evenodd" clipRule="evenodd" d="M9 16V14H7V16H3V14H1V16H3V18H7V22H9V18H11V16H9ZM9 16V18H7V16H9Z" fill="currentColor" />
              <path d="M15 4V6H9V4H15Z" fill="currentColor" />
              <path d="M19 6H17V4H15V2H19V6Z" fill="currentColor" />
              <path d="M19 12V6H21V12H19Z" fill="currentColor" />
              <path d="M17 14V12H19V14H17Z" fill="currentColor" />
              <path d="M15 16V14H17V16H15Z" fill="currentColor" />
              <path d="M15 18H13V16H15V18Z" fill="currentColor" />
              <path d="M15 18H17V22H15V18Z" fill="currentColor" />
            </svg>
            Check Github
          </a>
        </div>
      </div>
    </header>
  );
}
