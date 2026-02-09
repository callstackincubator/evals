import type { RunnerId } from "../config";
import type { RunnerContext, RunnerResult } from "./types";
import { runLlmJudgeRunner } from "./llm-judge";
import { runUnitRunner } from "./unit";

/*
  Runs configured runners and returns a keyed result map.
*/
export async function runConfiguredRunners(
  runnerIds: RunnerId[],
  context: RunnerContext,
): Promise<Record<string, RunnerResult>> {
  const runnerResults: Record<string, RunnerResult> = {};

  for (const runnerId of runnerIds) {
    try {
      if (runnerId === "unit") {
        runnerResults.unit = await runUnitRunner({
          workspacePath: context.workspace.path,
          readEvalResults: context.workspace.readEvalResults,
          evalId: context.evalId,
          debug: context.debug,
        });
        continue;
      }

      runnerResults["llm-judge"] = await runLlmJudgeRunner(
        context.workspace.path,
      );
    } catch (error) {
      runnerResults[runnerId] = {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return runnerResults;
}
