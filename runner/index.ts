import path from "node:path";
import {
  DEFAULT_PROMPT_SOURCE,
  DEFAULT_REPORT_ROOT,
  DEFAULT_WORKSPACE_ROOT,
  loadConfig,
} from "./config";
import { discoverEvals } from "./evals/discover";
import {
  applyModelOutput,
  createWorkspace,
  generateDiff,
  writeModelCache,
  writeRunResults,
} from "./workspace";
import { runModel } from "./model/index";
import { writeReport } from "./report/writer";
import { runConfiguredRunners } from "./runners/index";
import type { RunnerResult } from "./runners/types";

type Status = "pass" | "fail" | "error" | "skipped";
type ProgressCounts = Record<Status, number>;

/*
  Parses CLI args for config path and eval filtering.
*/
const args = process.argv.slice(2);
const configFlagIndex = args.indexOf("--config");
const evalFlagIndex = args.indexOf("--eval");
const allFlag = args.includes("--all");
const debug = args.includes("--debug");

const configPath = configFlagIndex >= 0 ? args[configFlagIndex + 1] : undefined;
const selectedEval = evalFlagIndex >= 0 ? args[evalFlagIndex + 1] : undefined;

/*
  Loads bench config and discovers evals to run.
*/
const config = await loadConfig(configPath);
const evals = await discoverEvals(config, {
  selectedEval,
  all: allFlag,
});

const runId = new Date().toISOString().replace(/[:.]/g, "-");
const results: Array<Record<string, unknown>> = [];
const totalRuns = config.models.length * evals.length;
let completedRuns = 0;
const progressCounts: ProgressCounts = {
  pass: 0,
  fail: 0,
  error: 0,
  skipped: 0,
};

console.log(`starting benchmark: ${totalRuns} run(s)`);

/*
  Resolves the aggregate report file path from a root directory or file path.
*/
function resolveReportPath(reportBase: string, runIdValue: string): string {
  const reportRoot =
    path.extname(reportBase) === ".json"
      ? path.dirname(reportBase)
      : reportBase;
  return path.join(reportRoot, `${runIdValue}.json`);
}

/*
  Collapses individual runner statuses into one overall run status.
*/
function resolveOverallStatus(
  runnerResults: Record<string, RunnerResult>,
): Status {
  const statuses = Object.values(runnerResults).map((item) => item.status);
  if (statuses.length === 0) {
    return "skipped";
  }
  if (statuses.includes("error")) {
    return "error";
  }
  if (statuses.includes("fail")) {
    return "fail";
  }
  if (statuses.every((status) => status === "skipped")) {
    return "skipped";
  }
  return "pass";
}

/*
  Prints progress including status counters after each completed run.
*/
function printProgress(options: {
  completed: number;
  total: number;
  counts: ProgressCounts;
  evalId: string;
  modelId: string;
  status: Status;
}): void {
  const { completed, total, counts, evalId, modelId, status } = options;
  console.log(
    `[${completed}/${total}] ${modelId} · ${evalId} -> ${status} | pass:${counts.pass} fail:${counts.fail} error:${counts.error} skipped:${counts.skipped}`,
  );
}

for (const model of config.models) {
  for (const evalItem of evals) {
    const start = Date.now();
    /*
      Copies eval into a run workspace and applies model output.
    */
    const workspace = await createWorkspace({
      evalPath: evalItem.evalPath,
      evalId: evalItem.evalId,
      modelId: model.id,
      workspaceRoot: DEFAULT_WORKSPACE_ROOT,
      runId,
    });

    const prompt = await evalItem.loadPrompt(DEFAULT_PROMPT_SOURCE);
    let modelOutput;
    try {
      modelOutput = await runModel(model);
      await applyModelOutput(workspace.path, modelOutput);
    } catch (error) {
      const durationMs = Date.now() - start;
      const errorResult = {
        eval_id: evalItem.evalId,
        model_id: model.id,
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        duration_ms: durationMs,
      };

      const runResultsPath = await writeRunResults({
        workspacePath: workspace.path,
        results: errorResult,
      });

      results.push({
        ...errorResult,
        run_results_path: runResultsPath,
        workspace_path: workspace.path,
      });

      completedRuns += 1;
      progressCounts.error += 1;
      printProgress({
        completed: completedRuns,
        total: totalRuns,
        counts: progressCounts,
        evalId: evalItem.evalId,
        modelId: model.id,
        status: "error",
      });

      if (debug) {
        console.error(`[${evalItem.evalId}] model error`, error);
      }
      continue;
    }

    /*
      Saves a diff between original eval and workspace.
    */
    const diffPath = await generateDiff({
      originalPath: evalItem.evalPath,
      workspacePath: workspace.path,
    });

    const modelOutputPath = await writeModelCache({
      workspacePath: workspace.path,
      modelId: model.id,
      prompt,
      output: modelOutput,
    });

    const runnerResults = await runConfiguredRunners(config.runners, {
      workspace,
      evalId: evalItem.evalId,
      debug,
    });

    const overallStatus = resolveOverallStatus(runnerResults);
    const bunRunnerResult = runnerResults.unit;
    const durationMs = Date.now() - start;
    const baseResult = {
      eval_id: evalItem.evalId,
      model_id: model.id,
      status: overallStatus,
      duration_ms: durationMs,
      runner_results: runnerResults,
      exit_code: bunRunnerResult?.exit_code,
      stdout: bunRunnerResult?.stdout,
      stderr: bunRunnerResult?.stderr,
      eval_results: bunRunnerResult?.eval_results,
    };

    const runResultsPath = await writeRunResults({
      workspacePath: workspace.path,
      results: baseResult,
    });

    results.push({
      ...baseResult,
      diff_path: diffPath,
      model_output_path: modelOutputPath,
      run_results_path: runResultsPath,
      workspace_path: workspace.path,
    });

    completedRuns += 1;
    progressCounts[overallStatus] += 1;
    printProgress({
      completed: completedRuns,
      total: totalRuns,
      counts: progressCounts,
      evalId: evalItem.evalId,
      modelId: model.id,
      status: overallStatus,
    });
  }
}

/*
  Persists the aggregate report.
*/
const reportPath = resolveReportPath(DEFAULT_REPORT_ROOT, runId);
await writeReport(reportPath, {
  run_id: runId,
  created_at: new Date().toISOString(),
  results,
});

console.log(`benchmark complete: ${reportPath}`);
