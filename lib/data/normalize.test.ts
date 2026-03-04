import { normalizeDashboardData } from "@/lib/data/normalize";
import type { AggregateDataset } from "@/lib/types/evals";

const datasetFixture: AggregateDataset = {
  version: "official-aggregate-v1",
  models: [
    {
      modelId: "model-alpha",
      label: "Model Alpha",
      results: {
        model_summary: {
          solver_model: "alpha/solver",
          n_runs: 10,
          weighted_avg_score: 0.75,
          requirements_passed: 3,
          requirements_total: 4,
          num_evals: 2,
          pass_at_1: 0.5,
          pass_at_5: 1,
          pass_at_10: 1,
          tokens_total: 12345,
        },
        per_eval: [
          {
            eval_id: "01-rn-nav-stack-product-details",
            short_label: "01 nav",
            category: "navigation",
            score_mean: 0.52,
            score_min: 0.4,
            score_median: 0.5,
            score_max: 0.8,
            score_stddev: 0.1,
            runs: 10,
            requirements_total: 2,
            pass_at_1: 0,
            pass_at_5: 0.5,
            pass_at_10: 1,
            tokens_mean: 111,
            tokens_median: 110.2,
            tokens_min: 98,
            tokens_max: 140,
            tokens_stddev: 12,
          },
          {
            eval_id: "01-rn-anim-pressable-scale-with-timing",
            short_label: "01 anim",
            category: "animation",
            score_mean: 0.9,
            score_min: 0.8,
            score_median: 1,
            score_max: 1,
            score_stddev: 0.07,
            runs: 10,
            requirements_total: 2,
            pass_at_1: 1,
            pass_at_5: 1,
            pass_at_10: 1,
            tokens_mean: 92,
            tokens_median: 90.8,
            tokens_min: 79,
            tokens_max: 105,
            tokens_stddev: 9,
          },
        ],
        per_requirement: [],
      },
    },
    {
      modelId: "model-beta",
      label: "Model Beta",
      results: {
        model_summary: {
          solver_model: "beta/solver",
          n_runs: 10,
          weighted_avg_score: 0.5,
          requirements_passed: 2,
          requirements_total: 4,
          num_evals: 2,
          pass_at_1: 0.2,
          pass_at_5: 0.6,
          pass_at_10: 1,
          tokens_total: 20000,
        },
        per_eval: [
          {
            eval_id: "01-rn-nav-stack-product-details",
            short_label: "01 nav",
            category: "navigation",
            score_mean: 0.7,
            score_min: 0.4,
            score_median: 0.75,
            score_max: 1,
            score_stddev: 0.2,
            runs: 10,
            requirements_total: 2,
            pass_at_1: 0.2,
            pass_at_5: 0.7,
            pass_at_10: 1,
            tokens_mean: 103,
            tokens_median: 100,
            tokens_min: 80,
            tokens_max: 130,
            tokens_stddev: 15,
          },
          {
            eval_id: "01-rn-anim-pressable-scale-with-timing",
            short_label: "01 anim",
            category: "animation",
            score_mean: 0.3,
            score_min: 0,
            score_median: 0.25,
            score_max: 0.6,
            score_stddev: 0.2,
            runs: 10,
            requirements_total: 2,
            pass_at_1: 0,
            pass_at_5: 0.2,
            pass_at_10: 0.5,
            tokens_mean: 85,
            tokens_median: 80,
            tokens_min: 60,
            tokens_max: 120,
            tokens_stddev: 20,
          },
        ],
        per_requirement: [],
      },
    },
  ],
};

describe("normalizeDashboardData", () => {
  it("normalizes median scores, token usage and eval matrix", () => {
    const normalized = normalizeDashboardData(datasetFixture);
    const alpha = normalized.models.find((model) => model.id === "model-alpha");
    const beta = normalized.models.find((model) => model.id === "model-beta");

    expect(alpha).toBeDefined();
    expect(beta).toBeDefined();

    expect(alpha?.overallScorePct).toBe(75);
    expect(alpha?.tokensUsed).toBe(1235);
    expect(alpha?.categories.navigation.scorePct).toBe(50);
    expect(alpha?.categories.animation.scorePct).toBe(100);
    expect(alpha?.categories.navigation.contributionPct).toBe(25);
    expect(alpha?.categories.animation.contributionPct).toBe(50);
    expect(alpha?.categories.navigation.tokensUsed).toBe(110);
    expect(alpha?.categories.animation.tokensUsed).toBe(91);
    expect(alpha?.categories.navigation.evals[0].tokensUsed).toBe(110.2);
    expect(alpha?.categories.navigation.evals[0].requirementsTotal).toBe(2);

    expect(beta?.categories.navigation.scorePct).toBe(75);
    expect(beta?.categories.animation.scorePct).toBe(25);

    const matrix = normalized.evalMatrixById["01-rn-nav-stack-product-details"];
    expect(matrix[0].modelId).toBe("model-beta");
    expect(matrix[0].scorePct).toBe(75);
    expect(matrix[1].modelId).toBe("model-alpha");
    expect(matrix[1].scorePct).toBe(50);

    expect(normalized.warnings.length).toBe(0);
  });
});
