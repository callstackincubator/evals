import { readFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import { z } from "zod";

const requirementSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  weight: z.number().positive().optional(),
});

const requirementsSchema = z.object({
  version: z.number().int().positive().default(1),
  inputs: z
    .object({
      files: z.array(z.string().min(1)).min(1),
    })
    .default({
      files: ["app/App.tsx", "app/package.json"],
    }),
  requirements: z.array(requirementSchema).min(1),
});

export type Requirement = z.infer<typeof requirementSchema>;
export type RequirementsDefinition = z.infer<typeof requirementsSchema>;

/*
  Checks whether an unknown error contains a string code field.
*/
function hasErrorCode(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  );
}

/*
  Loads per-eval judge requirements from YAML.
*/
export async function loadRequirements(
  workspacePath: string,
  fileName = "requirements.yaml",
): Promise<RequirementsDefinition | null> {
  const filePath = path.join(workspacePath, fileName);
  let raw = "";

  try {
    raw = await readFile(filePath, "utf8");
  } catch (error) {
    if (hasErrorCode(error) && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }

  const parsed = YAML.parse(raw);
  return requirementsSchema.parse(parsed);
}
