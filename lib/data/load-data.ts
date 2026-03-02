import fs from "node:fs";
import path from "node:path";
import { normalizeDashboardData } from "@/lib/data/normalize";
import {
  judgeDatasetSchema,
  judgeEvalResultSchema,
  judgeSummarySchema,
  type DashboardData,
  type JudgeDataset,
} from "@/lib/types/evals";

const RESULTS_ROOT_DIR = path.join(process.cwd(), "data", "judge_5models");

function isJsonFile(fileName: string): boolean {
  return fileName.endsWith(".json") && !fileName.startsWith("._");
}

function titleCaseWord(word: string): string {
  if (word.length === 0) {
    return word;
  }

  return word[0].toUpperCase() + word.slice(1);
}

function modelLabelFromId(modelId: string): string {
  const normalized = modelId.replace(/[-_]+/g, " ");
  return normalized
    .split(" ")
    .map((part) => titleCaseWord(part))
    .join(" ");
}

function loadDataset(): JudgeDataset {
  if (!fs.existsSync(RESULTS_ROOT_DIR)) {
    throw new Error(`Missing data directory: ${RESULTS_ROOT_DIR}`);
  }

  const models = fs
    .readdirSync(RESULTS_ROOT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .map((modelId) => {
      const modelDir = path.join(RESULTS_ROOT_DIR, modelId);
      const summaryPath = path.join(modelDir, "summary.json");

      if (!fs.existsSync(summaryPath)) {
        throw new Error(`Missing summary.json for model ${modelId}`);
      }

      const summary = judgeSummarySchema.parse(JSON.parse(fs.readFileSync(summaryPath, "utf-8")));

      const evalsDir = path.join(modelDir, "evals");
      if (!fs.existsSync(evalsDir)) {
        throw new Error(`Missing evals directory for model ${modelId}`);
      }

      const evals = fs
        .readdirSync(evalsDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .flatMap((categoryEntry) => {
          const categoryPath = path.join(evalsDir, categoryEntry.name);

          return fs
            .readdirSync(categoryPath, { withFileTypes: true })
            .filter((fileEntry) => fileEntry.isFile() && isJsonFile(fileEntry.name))
            .map((fileEntry) => {
              const evalPath = path.join(categoryPath, fileEntry.name);
              return judgeEvalResultSchema.parse(JSON.parse(fs.readFileSync(evalPath, "utf-8")));
            });
        })
        .sort((left, right) => left.evalId.localeCompare(right.evalId));

      return {
        modelId,
        label: modelLabelFromId(modelId),
        summary,
        evals,
      };
    });

  return judgeDatasetSchema.parse({
    version: "judge-zip-v1",
    models,
  });
}

export function loadDashboardData(): DashboardData {
  const dataset = loadDataset();
  return normalizeDashboardData(dataset);
}
