import { buildCategoryCostScatterData, buildOverviewCostScatterData } from "@/lib/data/cost-chart";
import { loadDashboardData } from "@/lib/data/load-data";

describe("cost scatter data", () => {
  it("builds the expected overview frontier from the priced dataset", () => {
    const data = loadDashboardData();
    const chartData = buildOverviewCostScatterData(data.models);

    expect(chartData.frontierPoints.map((point) => point.modelId)).toEqual([
      "GPT-OSS-20B",
      "GPT-OSS-120B",
      "mimo-v2.5-pro",
      "Apex",
    ]);
  });

  it("reports models with incomplete category cost data as omitted", () => {
    const data = loadDashboardData();
    const navigation = data.categories.find((category) => category.id === "navigation");

    expect(navigation).toBeDefined();

    const chartData = buildCategoryCostScatterData(navigation!, data.models);

    expect(chartData.omittedModelIds).toEqual([
      "composer-2",
      "composer-2-fast",
      "minimax-m3",
      "gemini-3.5-flash",
      "gemma-4-31B-it",
    ]);
    expect(chartData.points.some((point) => point.modelId === "DeepSeek-r1-distill-qwen-32B")).toBe(true);
    expect(chartData.points.some((point) => point.modelId === "qwen2.5-coder-32B-instruct")).toBe(true);
  });
});
