import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type EvalResults = {
  behavior_pass?: boolean;
  preference_pass?: boolean;
  constraint_pass?: boolean;
  overall_pass?: boolean;
  [key: string]: unknown;
};

/*
  Returns true when at least one regex matches the source content.
*/
export function hasAny(content: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(content));
}

/*
  Reads a UTF-8 text file from disk.
*/
export async function loadFileText(filePath: string): Promise<string> {
  return await readFile(filePath, "utf8");
}

/*
  Writes eval-results.json for the current workspace test run.
*/
export async function writeEvalResults(
  baseDir: string,
  results: EvalResults,
): Promise<void> {
  const outputDir =
    process.env.EVAL_RESULTS_DIR ||
    path.join(process.cwd(), "runs", path.basename(baseDir));
  await mkdir(outputDir, { recursive: true });
  const resultPath = path.join(outputDir, "eval-results.json");
  await writeFile(resultPath, JSON.stringify(results, null, 2), "utf8");
}
