import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const modelConfigSchema = z.object({
  id: z.string().min(1),
  provider: z.string().min(1),
  params: z.object({}).optional(),
});

export type ModelConfig = z.infer<typeof modelConfigSchema>;

export const runnerIds = ["unit", "llm-judge"] as const;
export type RunnerId = (typeof runnerIds)[number];

export const DEFAULT_PROMPT_SOURCE = "prompt.md";
export const DEFAULT_WORKSPACE_ROOT = "runs";
export const DEFAULT_REPORT_ROOT = "results";

const benchConfigSchema = z.object({
  models: z.array(modelConfigSchema),
  evals: z.array(z.string()).default([]),
  runners: z.array(z.enum(runnerIds)).default(["llm-judge"]),
});

export type BenchConfigInput = z.input<typeof benchConfigSchema>;
export type BenchConfig = z.infer<typeof benchConfigSchema>;

/*
  Loads bench config from disk and validates the expected shape.
*/
export async function loadConfig(configPath?: string): Promise<BenchConfig> {
  const resolvedPath = configPath
    ? path.resolve(process.cwd(), configPath)
    : path.join(process.cwd(), "bench.config.json");
  const raw = await readFile(resolvedPath, "utf8");
  return benchConfigSchema.parse(JSON.parse(raw));
}
