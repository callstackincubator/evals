import { z } from "zod";

export const aggregateModelSummarySchema = z.object({
  solver_model: z.string().min(1),
  n_runs: z.number().int().positive(),
  weighted_avg_score: z.number().min(0).max(1),
  requirements_passed: z.number().int().nonnegative(),
  requirements_total: z.number().int().positive(),
  num_evals: z.number().int().nonnegative(),
  pass_at_1: z.number().min(0).max(1),
  pass_at_5: z.number().min(0).max(1),
  pass_at_10: z.number().min(0).max(1),
  tokens_total: z.number().nonnegative(),
  tokens_mean: z.number().nonnegative().optional(),
  tokens_stddev: z.number().nonnegative().optional(),
  recorded_cost_total_usd: z.number().nonnegative().optional(),
  api_estimated_cost_total_usd: z.number().nonnegative().optional(),
  effective_cost_total_usd: z.number().nonnegative().optional(),
  cost_source: z.string().min(1).optional(),
  vercel_pricing_checked_on: z.string().min(1).optional(),
});

export const aggregatePerEvalSchema = z.object({
  eval_id: z.string().min(1),
  short_label: z.string().min(1),
  category: z.string().min(1),
  score_mean: z.number().min(0).max(1),
  score_min: z.number().min(0).max(1),
  score_median: z.number().min(0).max(1),
  score_max: z.number().min(0).max(1),
  score_stddev: z.number().nonnegative(),
  runs: z.number().int().positive(),
  requirements_total: z.number().int().positive(),
  pass_at_1: z.number().min(0).max(1),
  pass_at_5: z.number().min(0).max(1),
  pass_at_10: z.number().min(0).max(1),
  token_total: z.number().nonnegative().optional(),
  recorded_cost_total_usd: z.number().nonnegative().optional(),
  api_estimated_cost_total_usd: z.number().nonnegative().optional(),
  effective_cost_total_usd: z.number().nonnegative().optional(),
  cost_source: z.string().min(1).optional(),
  cost_priced_runs: z.number().int().nonnegative().optional(),
  cost_mean_usd: z.number().nonnegative().optional(),
  cost_median_usd: z.number().nonnegative().optional(),
  cost_min_usd: z.number().nonnegative().optional(),
  cost_max_usd: z.number().nonnegative().optional(),
  cost_stddev_usd: z.number().nonnegative().optional(),
  tokens_mean: z.number().nonnegative(),
  tokens_median: z.number().nonnegative(),
  tokens_min: z.number().nonnegative(),
  tokens_max: z.number().nonnegative(),
  tokens_stddev: z.number().nonnegative(),
});

export const aggregatePerRequirementSchema = z.object({
  category: z.string().min(1),
  eval_id: z.string().min(1),
  requirement_id: z.string().min(1),
  requirement_index: z.number().int().nonnegative(),
  n_runs: z.number().int().positive(),
  pass_rate: z.number().min(0).max(1),
  pass_rate_stddev: z.number().nonnegative(),
  pass_at_1: z.number().min(0).max(1),
  pass_at_5: z.number().min(0).max(1),
  pass_at_10: z.number().min(0).max(1),
  tokens_mean: z.number().nonnegative(),
  tokens_median: z.number().nonnegative(),
  tokens_min: z.number().nonnegative(),
  tokens_max: z.number().nonnegative(),
  tokens_stddev: z.number().nonnegative(),
});

export const aggregateModelFileSchema = z.object({
  model_summary: aggregateModelSummarySchema,
  per_eval: z.array(aggregatePerEvalSchema).min(1),
  per_requirement: z.array(aggregatePerRequirementSchema),
});

export const aggregateModelRunSchema = z.object({
  modelId: z.string().min(1),
  label: z.string().min(1),
  results: aggregateModelFileSchema,
});

export const aggregateDatasetSchema = z.object({
  version: z.string().min(1),
  models: z.array(aggregateModelRunSchema).min(1),
});

export type AggregateModelSummary = z.infer<typeof aggregateModelSummarySchema>;
export type AggregatePerEval = z.infer<typeof aggregatePerEvalSchema>;
export type AggregatePerRequirement = z.infer<typeof aggregatePerRequirementSchema>;
export type AggregateModelFile = z.infer<typeof aggregateModelFileSchema>;
export type AggregateModelRun = z.infer<typeof aggregateModelRunSchema>;
export type AggregateDataset = z.infer<typeof aggregateDatasetSchema>;

export interface CategoryDefinition {
  id: string;
  name: string;
  iconKey: string;
  order: number;
  evalCount: number;
}

export interface EvalScore {
  evalId: string;
  categoryId: string;
  name: string;
  scorePct: number;
  tokensUsed: number;
  costUsd: number | null;
  requirementsTotal: number;
}

export interface CategoryScore {
  categoryId: string;
  categoryName: string;
  iconKey: string;
  evalCount: number;
  evals: EvalScore[];
  scorePct: number;
  contributionPct: number;
  tokensUsed: number;
  costUsd: number | null;
}

export interface ModelSummary {
  id: string;
  label: string;
  solverModel: string;
  overallScorePct: number;
  tokensUsed: number;
  costUsd: number | null;
  requirementsPassed: number;
  requirementsTotal: number;
  categories: Record<string, CategoryScore>;
}

export interface EvalMatrixEntry {
  modelId: string;
  modelLabel: string;
  scorePct: number;
  tokensUsed: number;
  costUsd: number | null;
  requirementsTotal: number;
}

export interface DashboardData {
  categories: CategoryDefinition[];
  judgeModel: string;
  runStartedAt: string;
  runFinishedAt: string;
  runCount: number;
  warnings: string[];
  models: ModelSummary[];
  evalMatrixById: Record<string, EvalMatrixEntry[]>;
}
