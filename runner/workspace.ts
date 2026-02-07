import {
  access,
  copyFile,
  cp,
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import { spawn } from "node:child_process";
import * as path from "node:path";

export type ModelOutput = {
  patch?: string;
  files?: Array<{ path: string; content: string }>;
};

export type Workspace = {
  path: string;
  readEvalResults: () => Promise<Record<string, unknown> | null>;
};

type CommandResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

/*
  Returns true when a value is a plain object record.
*/
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/*
  Normalizes path segments used in workspace folder names.
*/
function sanitizeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/*
  Runs a command and returns collected stdout, stderr, and exit code.
*/
async function runCommand(
  command: string,
  args: string[],
  cwd: string,
  env?: NodeJS.ProcessEnv,
): Promise<CommandResult> {
  return await new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      env: env ? { ...process.env, ...env } : process.env,
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    child.on("close", (code) => {
      resolve({ exitCode: code ?? 1, stdout, stderr });
    });
  });
}

/*
  Creates a workspace copy for a single eval run.
*/
export async function createWorkspace(options: {
  evalPath: string;
  evalId: string;
  modelId: string;
  workspaceRoot?: string;
  runId: string;
}): Promise<Workspace> {
  const { evalPath, evalId, modelId, workspaceRoot, runId } = options;
  const workspaceBase = workspaceRoot ?? "runs";
  const workspaceParent = path.join(
    process.cwd(),
    workspaceBase,
    runId,
    sanitizeSegment(modelId),
  );
  const targetPath = path.join(workspaceParent, sanitizeSegment(evalId));

  await mkdir(workspaceParent, { recursive: true });
  await cp(evalPath, targetPath, { recursive: true });
  await seedAppFromBase(targetPath);

  return {
    path: targetPath,
    readEvalResults: async () => {
      try {
        const raw = await readFile(
          path.join(targetPath, "eval-results.json"),
          "utf8",
        );
        const parsed: unknown = JSON.parse(raw);
        return isRecord(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
  };
}

/*
  Seeds App.tsx from App.base.tsx when the base file exists.
*/
async function seedAppFromBase(workspacePath: string): Promise<void> {
  const appDir = path.join(workspacePath, "app");
  const appBasePath = path.join(appDir, "App.base.tsx");
  const appPath = path.join(appDir, "App.tsx");

  try {
    await access(appPath);
    return;
  } catch {
    // App.tsx does not exist, so we may seed it from App.base.tsx.
  }

  try {
    await access(appBasePath);
  } catch {
    return;
  }

  await copyFile(appBasePath, appPath);
}

/*
  Writes the model prompt/output payload captured for a workspace.
*/
export async function writeModelCache(options: {
  workspacePath: string;
  modelId: string;
  prompt: string;
  output: ModelOutput;
}): Promise<string> {
  const { workspacePath, modelId, prompt, output } = options;
  const cachePath = path.join(workspacePath, "model-output.json");
  const payload = {
    model_id: modelId,
    prompt,
    output,
  };
  await writeFile(cachePath, JSON.stringify(payload, null, 2), "utf8");
  return cachePath;
}

/*
  Persists per-workspace run results to run-results.json.
*/
export async function writeRunResults(options: {
  workspacePath: string;
  results: Record<string, unknown>;
}): Promise<string> {
  const { workspacePath, results } = options;
  const resultsPath = path.join(workspacePath, "run-results.json");
  await writeFile(resultsPath, JSON.stringify(results, null, 2), "utf8");
  return resultsPath;
}

/*
  Applies model output to the workspace (files or patch).
*/
export async function applyModelOutput(
  workspacePath: string,
  output: ModelOutput,
): Promise<void> {
  if (output.files && output.files.length > 0) {
    for (const file of output.files) {
      const filePath = path.join(workspacePath, file.path);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, file.content, "utf8");
    }
  }

  if (output.patch && output.patch.trim().length > 0) {
    const patchPath = path.join(workspacePath, "model.patch");
    await writeFile(patchPath, output.patch, "utf8");
    const result = await runCommand(
      "git",
      ["apply", "--unsafe-paths", patchPath],
      workspacePath,
    );
    if (result.exitCode !== 0) {
      throw new Error(
        `failed to apply patch: ${result.stderr || result.stdout}`,
      );
    }
  }
}

/*
  Generates a diff between the original eval and workspace.
*/
export async function generateDiff(options: {
  originalPath: string;
  workspacePath: string;
}): Promise<string> {
  const { originalPath, workspacePath } = options;
  const diffPath = path.join(workspacePath, "diff.patch");
  const result = await runCommand(
    "git",
    ["diff", "--no-index", originalPath, workspacePath],
    process.cwd(),
  );
  await writeFile(diffPath, result.stdout, "utf8");
  return diffPath;
}

/*
  Runs bun test inside the eval workspace.
*/
export async function runBunTests(
  workspacePath: string,
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const testPath = path.join(workspacePath, "eval.test.ts");
  const result = await runCommand("bun", ["test", testPath], workspacePath, {
    ...process.env,
    EVAL_RESULTS_DIR: workspacePath,
  });
  return result;
}
