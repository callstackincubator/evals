import { z } from "zod";

export const requirementStatusSchema = z.enum(["pass", "fail"]);

export const requirementDefinitionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
});

export const evalDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  prompt: z.string().min(1),
  requirements: z.array(requirementDefinitionSchema).min(3).max(10),
});

export const categoryDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  iconKey: z.string().min(1),
  order: z.number().int().nonnegative(),
  evals: z.array(evalDefinitionSchema).min(1),
});

export const evalCatalogSchema = z.object({
  version: z.string().min(1),
  categories: z.array(categoryDefinitionSchema).min(1),
});

export const requirementResultSchema = z.object({
  requirementId: z.string().min(1),
  status: requirementStatusSchema,
});

export const evalResultSchema = z.object({
  evalId: z.string().min(1),
  requirementResults: z.array(requirementResultSchema),
});

export const modelVariantResultsSchema = z.object({
  evalResults: z.array(evalResultSchema),
});

export const modelEntrySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  variants: z.object({
    vanilla: modelVariantResultsSchema,
    callstack: modelVariantResultsSchema,
  }),
});

export const modelResultsSchema = z.object({
  version: z.string().min(1),
  generatedAt: z.string().datetime(),
  sourceRepoUrl: z.string().url(),
  models: z.array(modelEntrySchema).min(1),
});

export type RequirementStatus = z.infer<typeof requirementStatusSchema>;
export type RequirementDefinition = z.infer<typeof requirementDefinitionSchema>;
export type EvalDefinition = z.infer<typeof evalDefinitionSchema>;
export type CategoryDefinition = z.infer<typeof categoryDefinitionSchema>;
export type EvalCatalog = z.infer<typeof evalCatalogSchema>;
export type RequirementResult = z.infer<typeof requirementResultSchema>;
export type EvalResult = z.infer<typeof evalResultSchema>;
export type ModelVariantResults = z.infer<typeof modelVariantResultsSchema>;
export type ModelEntry = z.infer<typeof modelEntrySchema>;
export type ModelResults = z.infer<typeof modelResultsSchema>;

export interface RequirementScore {
  requirementId: string;
  text: string;
  status: RequirementStatus;
}

export interface EvalScore {
  evalId: string;
  name: string;
  prompt: string;
  requirements: RequirementScore[];
  passedRequirements: number;
  totalRequirements: number;
  scorePct: number;
}

export interface CategoryScore {
  categoryId: string;
  categoryName: string;
  iconKey: string;
  evalCount: number;
  evals: EvalScore[];
  passedRequirements: number;
  totalRequirements: number;
  scorePct: number;
}

export interface VariantSummary {
  overallScorePct: number;
  passedRequirements: number;
  totalRequirements: number;
  categories: Record<string, CategoryScore>;
}

export interface ModelSummary {
  id: string;
  label: string;
  variants: {
    vanilla: VariantSummary;
    callstack: VariantSummary;
  };
  deltaOverallPct: number;
  maxOverallScorePct: number;
}

export interface DashboardData {
  catalog: EvalCatalog;
  generatedAt: string;
  sourceRepoUrl: string;
  warnings: string[];
  models: ModelSummary[];
}
