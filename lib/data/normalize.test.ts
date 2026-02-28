import { normalizeDashboardData } from "@/lib/data/normalize";
import type { EvalCatalog, ModelResults } from "@/lib/types/evals";

const catalogFixture: EvalCatalog = {
  version: "1.0.0",
  categories: [
    {
      id: "animation",
      name: "Animation",
      iconKey: "film-slate",
      order: 1,
      evals: [
        {
          id: "animation-01",
          name: "01 baseline",
          prompt: "Prompt",
          requirements: [
            { id: "r1", text: "Req 1" },
            { id: "r2", text: "Req 2" },
            { id: "r3", text: "Req 3" },
          ],
        },
      ],
    },
  ],
};

const resultsFixture: ModelResults = {
  version: "1.0.0",
  generatedAt: "2026-02-27T12:00:00.000Z",
  sourceRepoUrl: "https://github.com/callstack/rn-evals-results",
  models: [
    {
      id: "test-model",
      label: "Test Model",
      variants: {
        vanilla: {
          evalResults: [
            {
              evalId: "animation-01",
              requirementResults: [
                { requirementId: "r1", status: "pass" },
                { requirementId: "r2", status: "pass" },
              ],
            },
          ],
        },
        callstack: {
          evalResults: [
            {
              evalId: "animation-01",
              requirementResults: [
                { requirementId: "r1", status: "pass" },
                { requirementId: "r2", status: "pass" },
                { requirementId: "r3", status: "pass" },
              ],
            },
          ],
        },
      },
    },
  ],
};

describe("normalizeDashboardData", () => {
  it("treats missing requirement results as fail and warns", () => {
    const normalized = normalizeDashboardData(catalogFixture, resultsFixture);
    const model = normalized.models[0];

    expect(model.variants.vanilla.categories.animation.scorePct).toBeCloseTo(66.666, 1);
    expect(model.variants.callstack.categories.animation.scorePct).toBe(100);
    expect(normalized.warnings.length).toBe(1);
    expect(normalized.warnings[0]).toContain("missing result");
  });
});
