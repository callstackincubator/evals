import { runLlmJudge } from "../judge/index";
import type { RunnerResult } from "./types";

/*
  Executes the llm-judge runner and normalizes unexpected errors.
*/
export async function runLlmJudgeRunner(
  workspacePath: string,
): Promise<RunnerResult> {
  try {
    return await runLlmJudge({ workspacePath });
  } catch (error) {
    return {
      runner: "llm-judge",
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
