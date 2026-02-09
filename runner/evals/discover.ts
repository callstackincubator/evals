import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import type { BenchConfig } from "../config";

export type EvalItem = {
  evalId: string;
  evalPath: string;
  loadPrompt: (promptFile: string) => Promise<string>;
};

type DiscoverOptions = {
  selectedEval?: string;
  all: boolean;
};

/*
  Checks whether a filesystem path exists.
*/
async function exists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

/*
  Discovers eval folders with prompt.md and at least one evaluation artifact.
  Supports category folders under evals/, e.g. evals/navigation/<eval-id>.
*/
export async function discoverEvals(
  config: BenchConfig,
  options: DiscoverOptions,
): Promise<EvalItem[]> {
  const evalPaths = config.evals;
  const items: EvalItem[] = [];
  const baseDir = path.join(process.cwd(), "evals");
  const selected = options.selectedEval;

  const resolvedPaths: string[] = [];
  if (options.all || evalPaths.length === 0) {
    const entries = await readdir(baseDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const firstLevelPath = path.join(baseDir, entry.name);
        resolvedPaths.push(firstLevelPath);

        const subEntries = await readdir(firstLevelPath, {
          withFileTypes: true,
        });
        for (const subEntry of subEntries) {
          if (subEntry.isDirectory()) {
            resolvedPaths.push(path.join(firstLevelPath, subEntry.name));
          }
        }
      }
    }
  } else {
    for (const evalPath of evalPaths) {
      resolvedPaths.push(
        path.isAbsolute(evalPath)
          ? evalPath
          : path.join(process.cwd(), evalPath),
      );
    }
  }

  for (const evalPath of resolvedPaths) {
    const evalId = path.basename(evalPath);
    if (selected && selected !== evalId) {
      continue;
    }

    const promptPath = path.join(evalPath, "prompt.md");
    if (!(await exists(promptPath))) {
      continue;
    }

    const testPath = path.join(evalPath, "eval.test.ts");
    const requirementsPath = path.join(evalPath, "requirements.yaml");
    const hasUnitTest = await exists(testPath);
    const hasRequirements = await exists(requirementsPath);
    if (!hasUnitTest && !hasRequirements) {
      continue;
    }

    items.push({
      evalId,
      evalPath,
      loadPrompt: async (promptFile: string) => {
        const promptPath = path.join(evalPath, promptFile);
        return await readFileText(promptPath);
      },
    });
  }

  return items;
}

/*
  Reads a text file using UTF-8 encoding.
*/
async function readFileText(filePath: string): Promise<string> {
  return await readFile(filePath, "utf8");
}
