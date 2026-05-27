import { buildCategoryCostScatterData, buildOverviewCostScatterData } from "@/lib/data/cost-chart";
import { loadDashboardData } from "@/lib/data/load-data";

describe("cost scatter data", () => {
  it("builds the expected overview frontier from the priced dataset", () => {
    const data = loadDashboardData();
    const chartData = buildOverviewCostScatterData(data.models);

    expect(chartData.frontierPoints.map((point) => point.modelId)).toEqual([
      "GPT-OSS-20B",
      "GPT-OSS-120B",
      "Apex",
    ]);
  });

  it("includes every model in category cost views after effective fallback", () => {
    const data = loadDashboardData();
    const navigation = data.categories.find((category) => category.id === "navigation");

    expect(navigation).toBeDefined();

    const chartData = buildCategoryCostScatterData(navigation!, data.models);

    expect(chartData.omittedModelIds).toEqual([
      "composer-2",
      "composer-2-fast",
      "gemma-4-31B-it",
    ]);
    expect(chartData.points.some((point) => point.modelId === "DeepSeek-r1-distill-qwen-32B")).toBe(true);
    expect(chartData.points.some((point) => point.modelId === "qwen2.5-coder-32B-instruct")).toBe(true);
  });
});
