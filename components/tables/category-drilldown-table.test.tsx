import { fireEvent, render, screen } from "@testing-library/react";
import { CategoryDrilldownTable } from "@/components/tables/category-drilldown-table";
import type {
  CategoryDefinition,
  EvalMatrixEntry,
  ModelSummary,
} from "@/lib/types/evals";

const category: CategoryDefinition = {
  id: "navigation",
  name: "Navigation",
  iconKey: "navigation",
  order: 1,
  evalCount: 1,
};

const models: ModelSummary[] = [
  {
    id: "DeepSeek-r1-distill-qwen-32B",
    label: "DeepSeek R1 Distill Qwen 32B",
    solverModel: "deepseek/model",
    overallScorePct: 31.8,
    tokensUsed: 5000,
    costUsd: 3.02,
    requirementsPassed: 1,
    requirementsTotal: 4,
    categories: {
      navigation: {
        categoryId: "navigation",
        categoryName: "Navigation",
        iconKey: "navigation",
        evalCount: 1,
        evals: [
          {
            evalId: "01-rn-nav-stack-product-details",
            categoryId: "navigation",
            name: "Rn Nav Stack Product Details",
            scorePct: 50,
            tokensUsed: 110,
            costUsd: null,
            requirementsTotal: 2,
          },
        ],
        scorePct: 50,
        contributionPct: 25,
        tokensUsed: 110,
        costUsd: null,
      },
    },
  },
  {
    id: "model-beta",
    label: "Model Beta",
    solverModel: "beta/model",
    overallScorePct: 75,
    tokensUsed: 6000,
    costUsd: 9,
    requirementsPassed: 3,
    requirementsTotal: 4,
    categories: {
      navigation: {
        categoryId: "navigation",
        categoryName: "Navigation",
        iconKey: "navigation",
        evalCount: 1,
        evals: [
          {
            evalId: "01-rn-nav-stack-product-details",
            categoryId: "navigation",
            name: "Rn Nav Stack Product Details",
            scorePct: 75,
            tokensUsed: 100,
            costUsd: 0.12,
            requirementsTotal: 2,
          },
        ],
        scorePct: 75,
        contributionPct: 25,
        tokensUsed: 100,
        costUsd: 0.12,
      },
    },
  },
];

const evalMatrixById: Record<string, EvalMatrixEntry[]> = {
  "01-rn-nav-stack-product-details": [
    {
      modelId: "model-beta",
      modelLabel: "Model Beta",
      scorePct: 75,
      tokensUsed: 100,
      costUsd: 0.12,
      requirementsTotal: 2,
    },
    {
      modelId: "DeepSeek-r1-distill-qwen-32B",
      modelLabel: "DeepSeek R1 Distill Qwen 32B",
      scorePct: 50,
      tokensUsed: 110,
      costUsd: null,
      requirementsTotal: 2,
    },
  ],
};

describe("CategoryDrilldownTable", () => {
  it("keeps rows visible and renders blank cost values when drilldown cost is missing", () => {
    window.localStorage.setItem("rn-evals:category-table-alert-seen", "true");

    render(
      <CategoryDrilldownTable
        category={category}
        models={models}
        evalMatrixById={evalMatrixById}
      />,
    );

    fireEvent.click(screen.getByText("DeepSeek R1 Distill Qwen 32B"));

    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
    expect(screen.getByText("$0.12")).toBeInTheDocument();
  });
});
