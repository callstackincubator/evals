import path from "node:path";
import { loadConfig } from "./config";
import { discoverEvals } from "./discover";
import {
  applyModelOutput,
  createWorkspace,
  generateDiff,
  runBunTests,
  writeModelCache,
  writeRunResults,
} from "./workspace";
import { runModel } from "./model/index";
import { writeReport } from "./report/writer";

/*
  Parses CLI args for config path and eval filtering.
*/
const args = process.argv.slice(2);
const configFlagIndex = args.indexOf("--config");
const evalFlagIndex = args.indexOf("--eval");
const allFlag = args.includes("--all");
const debug = args.includes("--debug");

const configPath =
  configFlagIndex >= 0 ? args[configFlagIndex + 1] : undefined;
const selectedEval =
  evalFlagIndex >= 0 ? args[evalFlagIndex + 1] : undefined;

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

function resolveReportPath(reportBase: string, runIdValue: string): string {
  const reportRoot = path.extname(reportBase) === ".json"
    ? path.dirname(reportBase)
    : reportBase;
  return path.join(reportRoot, `${runIdValue}.json`);
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
      workspaceRoot: config.workspace_root,
      runId,
    });

    const prompt = await evalItem.loadPrompt(config.prompt_source);
    let modelOutput;
    try {
      modelOutput = await runModel(model, prompt);
      await applyModelOutput(workspace.path, modelOutput);
    } catch (error) {
      const runResultsPath = await writeRunResults({
        workspacePath: workspace.path,
        results: {
          eval_id: evalItem.evalId,
          model_id: model.id,
          status: "error",
          error: error instanceof Error ? error.message : String(error),
          duration_ms: Date.now() - start,
        },
      });
      results.push({
        eval_id: evalItem.evalId,
        model_id: model.id,
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        duration_ms: Date.now() - start,
        run_results_path: runResultsPath,
        workspace_path: workspace.path,
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

    /*
      Runs bun tests and collects eval results.
    */
    const testResult = await runBunTests(workspace.path);
    const evalResults = await workspace.readEvalResults();
    const runResultsPath = await writeRunResults({
      workspacePath: workspace.path,
      results: {
        eval_id: evalItem.evalId,
        model_id: model.id,
        status: testResult.exitCode === 0 ? "pass" : "fail",
        duration_ms: Date.now() - start,
        exit_code: testResult.exitCode,
        stdout: testResult.stdout,
        stderr: testResult.stderr,
        eval_results: evalResults,
      },
    });

    results.push({
      eval_id: evalItem.evalId,
      model_id: model.id,
      status: testResult.exitCode === 0 ? "pass" : "fail",
      duration_ms: Date.now() - start,
      diff_path: diffPath,
      stdout: testResult.stdout,
      stderr: testResult.stderr,
      eval_results: evalResults,
      model_output_path: modelOutputPath,
      run_results_path: runResultsPath,
      workspace_path: workspace.path,
    });

    if (debug && testResult.exitCode !== 0) {
      console.error(`[${evalItem.evalId}] test failed`, testResult.stderr);
    }
  }
}

/*
  Persists the aggregate report.
*/
const reportPath = resolveReportPath(config.report, runId);
await writeReport(reportPath, {
  run_id: runId,
  created_at: new Date().toISOString(),
  results,
});
