import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { CostScatterChart } from "@/components/charts/cost-scatter-chart";
import type { CategoryDefinition, ModelSummary } from "@/lib/types/evals";

vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");

  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  };
});

const category: CategoryDefinition = {
  id: "navigation",
  name: "Navigation",
  iconKey: "navigation",
  order: 1,
  evalCount: 1,
};

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
  {
    id: "model-beta",
    label: "Model Beta",
    solverModel: "beta/solver",
    overallScorePct: 60,
    tokensUsed: 1500,
    costUsd: 12,
    requirementsPassed: 2,
    requirementsTotal: 4,
    categories: {
      navigation: {
        categoryId: "navigation",
        categoryName: "Navigation",
        iconKey: "navigation",
        evalCount: 1,
        evals: [],
        scorePct: 40,
        contributionPct: 20,
        tokensUsed: 90,
        costUsd: 0.5,
      },
    },
  },
];

describe("CostScatterChart", () => {
  it("renders mobile and desktop chart containers", () => {
    const { container } = render(<CostScatterChart category={category} models={models} />);

    expect(screen.getAllByText(/on pareto frontier/i)).toHaveLength(1);
    expect(container.querySelector(".lg\\:hidden")).not.toBeNull();
    expect(container.querySelector(".hidden.lg\\:block")).not.toBeNull();
  });
});
