import { readFile } from "node:fs/promises";
import type { ModelConfig } from "../config";
import type { ModelOutput } from "../workspace";

type RunContext = {
  evalPath: string;
};

/*
  Model stub that reads output from env paths until provider integration exists.
*/
export async function runModel(
  model: ModelConfig,
  prompt: string,
): Promise<ModelOutput> {
  const jsonPath = process.env.MODEL_OUTPUT_JSON;
  const patchPath = process.env.MODEL_OUTPUT_PATH;

  if (jsonPath) {
    const raw = await readFile(jsonPath, "utf8");
    return JSON.parse(raw) as ModelOutput;
  }

  if (patchPath) {
    const patch = await readFile(patchPath, "utf8");
    return { patch };
  }

  if (model.provider === "noop") {
    return { patch: "" };
  }

  void prompt;
  throw new Error("model provider not configured; set MODEL_OUTPUT_JSON or MODEL_OUTPUT_PATH");
}
