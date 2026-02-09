import { readFile } from "node:fs/promises";
import type { ModelConfig } from "../config";
import type { ModelOutput } from "../workspace";

/*
  Validates whether parsed JSON follows the expected model output shape.
*/
function isModelOutput(value: unknown): value is ModelOutput {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("patch" in value) && !("files" in value)) {
    return false;
  }

  const patch = "patch" in value ? value.patch : undefined;
  if (patch !== undefined && typeof patch !== "string") {
    return false;
  }

  const files = "files" in value ? value.files : undefined;
  if (files === undefined) {
    return true;
  }

  if (!Array.isArray(files)) {
    return false;
  }

  return files.every((item) => {
    if (typeof item !== "object" || item === null) {
      return false;
    }
    if (!("path" in item) || !("content" in item)) {
      return false;
    }
    return typeof item.path === "string" && typeof item.content === "string";
  });
}

/*
  Loads model output from configured env inputs or returns noop output.
*/
export async function runModel(model: ModelConfig): Promise<ModelOutput> {
  const jsonPath = process.env.MODEL_OUTPUT_JSON;
  const patchPath = process.env.MODEL_OUTPUT_PATH;

  if (jsonPath) {
    const raw = await readFile(jsonPath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!isModelOutput(parsed)) {
      throw new Error(
        "MODEL_OUTPUT_JSON does not match expected ModelOutput shape",
      );
    }
    return parsed;
  }

  if (patchPath) {
    const patch = await readFile(patchPath, "utf8");
    return { patch };
  }

  if (model.provider === "noop") {
    return { patch: "" };
  }

  throw new Error(
    "model provider not configured; set MODEL_OUTPUT_JSON or MODEL_OUTPUT_PATH",
  );
}
