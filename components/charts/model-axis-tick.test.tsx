import { describe, expect, it } from "vitest";
import { getDesktopModelAxisLabelWidth } from "@/components/charts/model-axis-tick";

describe("getDesktopModelAxisLabelWidth", () => {
  it("keeps at least one pixel between adjacent desktop labels", () => {
    const containerWidth = 1140;
    const labelCount = 16;
    const chartWidth = containerWidth - 44;
    const labelWidth = getDesktopModelAxisLabelWidth(containerWidth, labelCount);

    expect(labelWidth).toBe(66);
    expect(chartWidth / labelCount - labelWidth).toBeGreaterThanOrEqual(1);
  });

  it("preserves the gap when Recharts places ticks on fractional slot widths", () => {
    const containerWidth = 1048;
    const labelCount = 14;
    const chartWidth = containerWidth - 44;
    const labelWidth = getDesktopModelAxisLabelWidth(containerWidth, labelCount);

    expect(labelWidth).toBe(69);
    expect(chartWidth / labelCount - labelWidth).toBeGreaterThanOrEqual(1);
  });

  it("uses a compact fallback before the chart has been measured", () => {
    expect(getDesktopModelAxisLabelWidth(0, 16)).toBe(64);
  });
});
