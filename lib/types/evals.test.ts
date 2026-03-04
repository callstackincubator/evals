import { aggregateModelFileSchema } from "@/lib/types/evals";

describe("aggregateModelFileSchema", () => {
  const validModel = {
    model_summary: {
      solver_model: "provider/model",
      n_runs: 10,
      weighted_avg_score: 0.5,
      requirements_passed: 850,
      requirements_total: 1700,
      num_evals: 40,
      pass_at_1: 0.1,
      pass_at_5: 0.4,
      pass_at_10: 0.7,
      tokens_total: 123456,
    },
    per_eval: [
      {
        eval_id: "01-rn-nav-stack-product-details",
        short_label: "01 nav",
        category: "navigation",
        score_mean: 0.5,
        score_min: 0,
        score_median: 0.5,
        score_max: 1,
        score_stddev: 0.3,
        runs: 10,
        requirements_total: 5,
        pass_at_1: 0,
        pass_at_5: 0.5,
        pass_at_10: 1,
        tokens_mean: 3000,
        tokens_median: 2900,
        tokens_min: 2500,
        tokens_max: 3600,
        tokens_stddev: 240,
      },
    ],
    per_requirement: [
      {
        category: "navigation",
        eval_id: "01-rn-nav-stack-product-details",
        requirement_id: "some-requirement",
        requirement_index: 0,
        n_runs: 10,
        pass_rate: 0.6,
        pass_rate_stddev: 0.2,
        pass_at_1: 0,
        pass_at_5: 0.6,
        pass_at_10: 1,
        tokens_mean: 3000,
        tokens_median: 2900,
        tokens_min: 2500,
        tokens_max: 3600,
        tokens_stddev: 240,
      },
    ],
  };

  it("parses a valid aggregate model file", () => {
    const parsed = aggregateModelFileSchema.parse(validModel);
    expect(parsed.model_summary.n_runs).toBe(10);
    expect(parsed.per_eval[0].score_median).toBe(0.5);
  });

  it("fails when required numeric fields are missing", () => {
    const invalidModel = {
      ...validModel,
      model_summary: {
        ...validModel.model_summary,
      },
    } as Record<string, unknown>;

    delete (invalidModel.model_summary as Record<string, unknown>).tokens_total;

    expect(() => aggregateModelFileSchema.parse(invalidModel)).toThrow();
  });
});
