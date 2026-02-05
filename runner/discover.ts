import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import type { BenchConfig } from "./config";

export type EvalItem = {
  evalId: string;
  evalPath: string;
  loadPrompt: (promptFile: string) => Promise<string>;
};

type DiscoverOptions = {
  selectedEval?: string;
  all: boolean;
};

async function exists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

/*
  Discovers eval folders with eval.test.ts and optional filter.
*/
export async function discoverEvals(
  config: BenchConfig,
  options: DiscoverOptions,
): Promise<EvalItem[]> {
  const evalPaths = config.evals;
  const items: EvalItem[] = [];
  const baseDir = path.join(process.cwd(), "evals");
  const selected = options.selectedEval;

  const resolvedPaths = [] as string[];
  if (options.all || evalPaths.length === 0) {
    const entries = await readdir(baseDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        resolvedPaths.push(path.join(baseDir, entry.name));
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
    const testPath = path.join(evalPath, "eval.test.ts");
    if (!(await exists(testPath))) {
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

async function readFileText(filePath: string): Promise<string> {
  return await readFile(filePath, "utf8");
}
