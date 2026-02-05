import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

export type ModelConfig = {
  id: string;
  provider: string;
  params?: Record<string, unknown>;
};

const benchConfigSchema = z.object({
  models: z
    .array(
      z.object({
        id: z.string().min(1),
        provider: z.string().min(1),
        params: z.object({}).optional(),
      }),
    ),
  evals: z.array(z.string()).default([]),
  prompt_source: z.string().default("prompt.md"),
  workspace_root: z.string().default("runs"),
  report: z.string().default("results"),
});

export type BenchConfigInput = z.input<typeof benchConfigSchema>;

export type BenchConfig = {
  models: ModelConfig[];
  evals: string[];
  prompt_source: string;
  workspace_root: string;
  report: string;
};

/*
  Loads bench config from disk and applies defaults.
*/
export async function loadConfig(configPath?: string): Promise<BenchConfig> {
  const resolvedPath = configPath
    ? path.resolve(process.cwd(), configPath)
    : path.join(process.cwd(), "bench.config.json");
  const raw = await readFile(resolvedPath, "utf8");
  return benchConfigSchema.parse(JSON.parse(raw))
}
