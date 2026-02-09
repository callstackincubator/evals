import { access } from "node:fs/promises";
import path from "node:path";
import { runBunTests } from "../workspace";
import type { RunnerResult } from "./types";

/*
  Executes the unit runner for an eval workspace.
*/
export async function runUnitRunner(options: {
  workspacePath: string;
  readEvalResults: () => Promise<Record<string, unknown> | null>;
  evalId: string;
  debug: boolean;
}): Promise<RunnerResult> {
  const testPath = path.join(options.workspacePath, "eval.test.ts");
  try {
    await access(testPath);
  } catch {
    return {
      runner: "unit",
      status: "skipped",
      reason: "eval.test.ts not found",
    };
  }

  let testResult: Awaited<ReturnType<typeof runBunTests>>;
  try {
    testResult = await runBunTests(options.workspacePath);
  } catch (error) {
    return {
      runner: "unit",
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    };
  }

  const evalResults = await options.readEvalResults();

  if (options.debug && testResult.exitCode !== 0) {
    console.error(`[${options.evalId}] test failed`, testResult.stderr);
  }

  return {
    runner: "unit",
    status: testResult.exitCode === 0 ? "pass" : "fail",
    exit_code: testResult.exitCode,
    stdout: testResult.stdout,
    stderr: testResult.stderr,
    eval_results: evalResults,
  };
}
