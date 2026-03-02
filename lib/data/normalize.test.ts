import { normalizeDashboardData } from "@/lib/data/normalize";
import type { JudgeDataset } from "@/lib/types/evals";

const datasetFixture: JudgeDataset = {
  version: "judge-zip-v1",
  models: [
    {
      modelId: "test-model",
      label: "Test Model",
      summary: {
        runId: "run-1",
        startedAt: "2026-02-28T20:10:15.634Z",
        finishedAt: "2026-02-28T20:24:03.087Z",
        judgeModel: "anthropic/claude-sonnet-4-6",
        solverModel: "openai/test-model",
        pattern: "evals/**/*",
        inputGeneratedArtifacts: "generated/test-model",
        evalCount: 2,
        evalsProcessed: 2,
        evalsErrored: 0,
        requirementsTotal: 5,
        requirementsPassed: 4,
        weightedAverageScore: 0.8,
      },
      evals: [
        {
          evalId: "01-rn-nav-stack-product-details",
          evalPath: "evals/navigation/01-rn-nav-stack-product-details",
          judgeModel: "anthropic/claude-sonnet-4-6",
          solverModel: "openai/test-model",
          llmJudgeRequirements: [
            {
              id: "req-1",
              description: "Requirement A",
              weight: 1,
              passed: true,
              reason: "ok",
              evidence: [],
              confidence: 1,
            },
            {
              id: "req-2",
              description: "Requirement B",
              weight: 1,
              passed: false,
              reason: "fail",
              evidence: [],
            },
          ],
          score: {
            passedWeight: 1,
            totalWeight: 2,
            ratio: 0.5,
          },
          outputFiles: ["App.tsx"],
        },
        {
          evalId: "01-rn-anim-pressable-scale-with-timing",
          evalPath: "evals/animation/01-rn-anim-pressable-scale-with-timing",
          judgeModel: "anthropic/claude-sonnet-4-6",
          solverModel: "openai/test-model",
          llmJudgeRequirements: [
            {
              id: "req-3",
              description: "Requirement C",
              weight: 1,
              passed: true,
              reason: "ok",
              evidence: [],
            },
            {
              id: "req-4",
              description: "Requirement D",
              weight: 2,
              passed: true,
              reason: "ok",
              evidence: [],
            },
          ],
          score: {
            passedWeight: 3,
            totalWeight: 3,
            ratio: 1,
          },
          outputFiles: ["App.tsx"],
        },
      ],
    },
  ],
};

describe("normalizeDashboardData", () => {
  it("normalizes weighted scores and requirement statuses", () => {
    const normalized = normalizeDashboardData(datasetFixture);
    const model = normalized.models[0];

    expect(model.overallScorePct).toBe(80);
    expect(model.categories.navigation.scorePct).toBe(50);
    expect(model.categories.animation.scorePct).toBe(100);
    expect(model.categories.navigation.evals[0].requirements[0].status).toBe("pass");
    expect(model.categories.navigation.evals[0].requirements[1].status).toBe("fail");
    expect(model.categories.navigation.evals[0].requirements[0].confidence).toBe(1);
    expect(normalized.warnings.length).toBe(0);
  });
});
