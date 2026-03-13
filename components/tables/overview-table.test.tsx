import { render, screen } from "@testing-library/react";
import { OverviewTable } from "@/components/tables/overview-table";
import type { CategoryDefinition, ModelSummary } from "@/lib/types/evals";

const categories: CategoryDefinition[] = [
  {
    id: "navigation",
    name: "Navigation",
    iconKey: "navigation",
    order: 1,
    evalCount: 1,
  },
];

const models: ModelSummary[] = [
  {
    id: "model-alpha",
    label: "Model Alpha",
    solverModel: "alpha/solver",
    overallScorePct: 75,
    tokensUsed: 1235,
    costUsd: 9,
    requirementsPassed: 3,
    requirementsTotal: 4,
    categories: {
      navigation: {
        categoryId: "navigation",
        categoryName: "Navigation",
        iconKey: "navigation",
        evalCount: 1,
        evals: [],
        scorePct: 50,
        contributionPct: 25,
        tokensUsed: 110,
        costUsd: 0.12,
      },
    },
  },
];

describe("OverviewTable", () => {
  it("renders cost after tokens used", () => {
    render(<OverviewTable categories={categories} models={models} />);

    const headers = screen.getAllByRole("columnheader").map((header) => header.textContent);

    expect(headers).toEqual(["Model", "Overall", "Navigation", "Tokens Used", "Cost"]);
    expect(screen.getByText("$9.00")).toBeInTheDocument();
  });
});
