import { z } from "zod";

export const judgeSummarySchema = z.object({
  runId: z.string().min(1),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime(),
  judgeModel: z.string().min(1),
  solverModel: z.string().min(1),
  pattern: z.string().min(1),
  inputGeneratedArtifacts: z.string().min(1),
  evalCount: z.number().int().nonnegative(),
  evalsProcessed: z.number().int().nonnegative(),
  evalsErrored: z.number().int().nonnegative(),
  requirementsTotal: z.number().int().nonnegative(),
  requirementsPassed: z.number().int().nonnegative(),
  weightedAverageScore: z.number().min(0).max(1),
});

export const judgeRequirementSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  weight: z.number().nonnegative(),
  passed: z.boolean(),
  reason: z.string().min(1),
  evidence: z.array(z.string()),
  confidence: z.number().min(0).max(1).optional(),
});

export const judgeEvalScoreSchema = z.object({
  passedWeight: z.number().nonnegative(),
  totalWeight: z.number().positive(),
  ratio: z.number().min(0).max(1),
});

export const judgeEvalResultSchema = z.object({
  evalId: z.string().min(1),
  evalPath: z.string().min(1),
  judgeModel: z.string().min(1),
  solverModel: z.string().min(1),
  llmJudgeRequirements: z.array(judgeRequirementSchema),
  score: judgeEvalScoreSchema,
  outputFiles: z.array(z.string()).default([]),
});

export const judgeModelRunSchema = z.object({
  modelId: z.string().min(1),
  label: z.string().min(1),
  summary: judgeSummarySchema,
  evals: z.array(judgeEvalResultSchema),
});

export const judgeDatasetSchema = z.object({
  version: z.string().min(1),
  models: z.array(judgeModelRunSchema).min(1),
});

export type JudgeSummary = z.infer<typeof judgeSummarySchema>;
export type JudgeRequirement = z.infer<typeof judgeRequirementSchema>;
export type JudgeEvalScore = z.infer<typeof judgeEvalScoreSchema>;
export type JudgeEvalResult = z.infer<typeof judgeEvalResultSchema>;
export type JudgeModelRun = z.infer<typeof judgeModelRunSchema>;
export type JudgeDataset = z.infer<typeof judgeDatasetSchema>;

export interface CategoryDefinition {
  id: string;
  name: string;
  iconKey: string;
  order: number;
  evalCount: number;
}

export interface RequirementScore {
  requirementId: string;
  description: string;
  status: "pass" | "fail";
  confidence?: number;
}

export interface EvalScore {
  evalId: string;
  evalPath: string;
  name: string;
  outputFiles: string[];
  requirements: RequirementScore[];
  passedWeight: number;
  totalWeight: number;
  scorePct: number;
}

export interface CategoryScore {
  categoryId: string;
  categoryName: string;
  iconKey: string;
  evalCount: number;
  evals: EvalScore[];
  passedWeight: number;
  totalWeight: number;
  scorePct: number;
}

export interface ModelSummary {
  id: string;
  label: string;
  solverModel: string;
  overallScorePct: number;
  requirementsPassed: number;
  requirementsTotal: number;
  categories: Record<string, CategoryScore>;
}

export interface DashboardData {
  categories: CategoryDefinition[];
  judgeModel: string;
  runStartedAt: string;
  runFinishedAt: string;
  warnings: string[];
  models: ModelSummary[];
}
