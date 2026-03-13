import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

interface FormatUsdOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function formatUsd(value: number, options: FormatUsdOptions = {}): string {
  const { minimumFractionDigits = 2, maximumFractionDigits = 2 } = options;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

export function formatUsdPrecise(value: number): string {
  const maximumFractionDigits = value >= 1 ? 2 : 4;

  return formatUsd(value, {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  });
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
