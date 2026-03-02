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

function ExpoSdkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M22.9601 17.9322H22.0036V15.9781V15.9382H21.9638H21.0072V13.984V13.9442H20.9674H20.0109V11.99V11.9501H19.971H19.0145V9.99601V9.95613H18.9746H18.0181V8.00199V7.96211H17.9783H17.0217V6.00798V5.9681H16.9819H16.0254V4.01396V3.97408H15.9855H14.0127V2.01994V2H13.9928H12H10.0072H9.98732V2.01994V3.97408H8.01449H7.97464V4.01396V5.9681H7.01812H6.97826V6.00798V7.96211H6.02174H5.98188V8.00199V9.95613H5.02536H4.98551V9.99601V11.9501H4.02899H3.98913V11.99V13.9442H3.03261H2.99275V13.984V15.9382H2.03623H1.99638V15.9781V17.9322H1.03986H1V17.9721V19.9661V20.006H1.03986H1.99638V21.9601V22H2.03623H4.02899H4.06884V21.9601V20.006H5.02536H5.06522V19.9661V18.012H6.02174H6.06159V17.9721V16.0179H7.01812H7.05797V15.9781V14.0239H8.01449H8.05435V13.984V12.0299H9.01087H9.05072V11.99V10.0359H10.0072H10.0471V9.99601V8.04187H11.0036H11.0435V8.00199V6.02792H12H12.9565V8.00199V8.04187H12.9964H13.9529V9.99601V10.0359H13.9928H14.9493V11.99V12.0299H14.9891H15.9457V13.984V14.0239H15.9855H16.942V15.9781V16.0179H16.9819H17.9384V17.9721V18.012H17.9783H18.9348V19.9661V20.006H18.9746H19.9312V21.9601V22H19.971H21.9638H22.0036V21.9601V20.006H22.9601H23V19.9661V17.9721V17.9322H22.9601Z"
        fill="currentColor"
      />
    </svg>
  );
}

type CategoryIcon = () => ReactElement;

const iconByCategoryId: Record<string, CategoryIcon> = {
  animation: AnimationIcon,
  "async-state": AsyncStateIcon,
  "expo-sdk": ExpoSdkIcon,
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
  return (
    <nav className="min-w-0 overflow-x-auto">
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
  );
}
