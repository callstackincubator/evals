import fs from "node:fs";
import path from "node:path";
import { normalizeDashboardData } from "@/lib/data/normalize";
import {
  aggregateDatasetSchema,
  aggregateModelFileSchema,
  type AggregateDataset,
  type DashboardData,
} from "@/lib/types/evals";

const RESULTS_ROOT_DIR = path.join(process.cwd(), "data", "official-results");

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
  return modelId
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => titleCaseWord(part))
    .join(" ");
}

function modelIdFromFileName(fileName: string): string {
  return fileName.replace(/\.json$/i, "");
}

function loadDataset(): AggregateDataset {
  if (!fs.existsSync(RESULTS_ROOT_DIR)) {
    throw new Error(`Missing data directory: ${RESULTS_ROOT_DIR}`);
  }

  const modelFiles = fs
    .readdirSync(RESULTS_ROOT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && isJsonFile(entry.name))
    .map((entry) => entry.name)
    .sort();

  const models = modelFiles.map((fileName) => {
    const modelId = modelIdFromFileName(fileName);
    const filePath = path.join(RESULTS_ROOT_DIR, fileName);
    const parsed = aggregateModelFileSchema.parse(
      JSON.parse(fs.readFileSync(filePath, "utf-8")),
    );

    return {
      modelId,
      label: modelLabelFromId(modelId),
      results: parsed,
    };
  });

  return aggregateDatasetSchema.parse({
    version: "official-aggregate-v1",
    models,
  });
}

export function loadDashboardData(): DashboardData {
  const dataset = loadDataset();
  return normalizeDashboardData(dataset);
}
