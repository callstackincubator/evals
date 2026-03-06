"use client";

import type { ReactElement } from "react";
import { cn } from "@/lib/utils";
import type { CategoryDefinition } from "@/lib/types/evals";

export type DashboardTabId = "overview" | string;

interface NavigationCategoriesProps {
  categories: CategoryDefinition[];
  activeTab: DashboardTabId;
  onTabChange: (tabId: DashboardTabId) => void;
}

function AnimationIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M12 21H10V19H12V21ZM14 19H12V17H14V19ZM6 17H4V15H6V17ZM12 17H10V15H6V13H8V11H10V9H12V7H14V5H18V9H16V11H14V13H12V17ZM4 15H2V13H4V15ZM20 15H18V13H20V15ZM18 13H16V11H18V13ZM22 13H20V11H22V13ZM8 7H6V5H8V7ZM12 7H10V5H12V7ZM10 5H8V3H10V5Z" />
    </svg>
  );
}

function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M21 21H3V3H21V21ZM5 19H19V5H5V19ZM9 17H7V11H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" />
    </svg>
  );
}

function AsyncStateIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M10 20H14V18H16V22H8V18H10V20ZM7 17H5V15H7V17ZM19 17H17V15H19V17ZM9 11H11V13H9V15H7V13H2V11H7V9H9V11ZM17 11H22V13H17V15H15V13H13V11H15V9H17V11ZM7 7V9H5V7H7ZM19 9H17V7H19V9ZM16 6H14V4H10V6H8V2H16V6Z" />
    </svg>
  );
}

function PermissionsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M21 21H3V3H21V21ZM5 19H19V5H5V19ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" />
    </svg>
  );
}

function ListsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M16 20H14V18H16V20ZM20 20H18V18H20V20ZM11 18H3V16H11V18ZM18 18H16V16H18V18ZM16 16H14V14H16V16ZM20 16H18V14H20V16ZM17 10H15V8H17V10ZM11 8H3V6H11V8ZM15 8H13V6H15V8ZM19 8H17V6H19V8ZM21 6H19V4H21V6Z" />
    </svg>
  );
}

function NavigationIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M11 13V21H3V13H11ZM18 16H21V18H18V21H16V18H13V16H16V13H18V16ZM5 15V19H9V15H5ZM11 11H3V3H11V11ZM21 11H13V3H21V11ZM5 9H9V5H5V9ZM15 9H19V5H15V9Z" />
    </svg>
  );
}

function StorageIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M4 6V18H20V8H10V6H4ZM22 6V20H2V4H12V6H22Z" />
    </svg>
  );
}

type CategoryIcon = () => ReactElement;

const iconByCategoryId: Record<string, CategoryIcon> = {
  animation: AnimationIcon,
  "async-state": AsyncStateIcon,
  permissions: PermissionsIcon,
  lists: ListsIcon,
  navigation: NavigationIcon,
  storage: StorageIcon,
};

function getCategoryIcon(categoryId: string) {
  return iconByCategoryId[categoryId];
}

export function NavigationCategories({
  categories,
  activeTab,
  onTabChange,
}: NavigationCategoriesProps) {
  const options = [{ id: "overview", name: "Overview" }, ...categories];

  return (
    <>
      <div className="lg:hidden">
        <label htmlFor="dashboard-category-select" className="sr-only">
          Category
        </label>
        <select
          id="dashboard-category-select"
          value={activeTab}
          onChange={(event) => onTabChange(event.target.value)}
          className="h-10 w-full border border-zinc-800 bg-zinc-950 px-3 text-sm font-medium text-zinc-100"
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <nav className="hidden min-w-0 overflow-x-auto lg:block">
        <ul className="flex items-center gap-1">
          <li>
            <button
              type="button"
              onClick={() => onTabChange("overview")}
              className={cn(
                "inline-flex h-9 items-center gap-2 border border-transparent px-3 text-sm font-medium transition-colors",
                activeTab === "overview"
                  ? "border-zinc-600 bg-zinc-100 text-zinc-900"
                  : "text-zinc-300 hover:border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100",
              )}
            >
              <OverviewIcon />
              Overview
            </button>
          </li>

          {categories.map((category) => {
            const Icon = getCategoryIcon(category.id);

            return (
              <li key={category.id}>
                <button
                  type="button"
                  onClick={() => onTabChange(category.id)}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 border border-transparent px-3 text-sm font-medium transition-colors whitespace-nowrap",
                    activeTab === category.id
                      ? "border-zinc-600 bg-zinc-100 text-zinc-900"
                      : "text-zinc-300 hover:border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100",
                  )}
                >
                  {Icon ? <Icon /> : <OverviewIcon />}
                  {category.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
