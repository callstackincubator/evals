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
  Returns true when any pattern matches the content.
*/
export function hasAny(content: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(content));
}

/*
  Loads a file as UTF-8 text.
*/
export async function loadFileText(filePath: string): Promise<string> {
  return await readFile(filePath, "utf8");
}

/*
  Writes eval-results.json in the provided base directory.
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
