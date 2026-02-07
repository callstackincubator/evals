import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Output, generateText } from "ai";
import { createOpencode } from "ai-sdk-provider-opencode-sdk";
import { z } from "zod";
import type { Requirement, RequirementsDefinition } from "./requirements";
import { loadRequirements } from "./requirements";

type RequirementResult = {
  id: string;
  description: string;
  weight?: number;
  passed: boolean;
  reason: string;
  evidence: string[];
  confidence?: number;
};

type JudgeStatus = "pass" | "fail" | "error" | "skipped";

export type JudgeRunResult = {
  runner: "llm-judge";
  status: JudgeStatus;
  requirement_results: RequirementResult[];
  summary?: string;
  requirements_path?: string;
  prompt_path?: string;
  output_path?: string;
  stderr?: string;
  error?: string;
};

const judgeOutputSchema = z.object({
  summary: z.string().optional(),
  requirements: z.array(
    z.object({
      id: z.string().min(1),
      passed: z.boolean(),
      reason: z.string().min(1),
      evidence: z.array(z.string()).default([]),
      confidence: z.number().min(0).max(1).optional(),
    }),
  ),
});

type JudgeOutput = z.infer<typeof judgeOutputSchema>;

const DEFAULT_INPUT_FILE_MAX_CHARS = 20_000;

export const OPEN_CODE_HARNESS_MODEL =
  process.env.LLM_JUDGE_MODEL ?? "openai/gpt-5.3-codex";
const configuredTimeoutMs = Number(process.env.LLM_JUDGE_TIMEOUT_MS ?? 120_000);
export const OPEN_CODE_HARNESS_TIMEOUT_MS = Number.isFinite(configuredTimeoutMs)
  ? configuredTimeoutMs
  : 120_000;
const configuredPort = Number(process.env.LLM_JUDGE_PORT ?? 4096);
export const OPEN_CODE_HARNESS_PORT = Number.isFinite(configuredPort)
  ? configuredPort
  : 4096;

/*
  Removes common indentation from a multi-line template literal.
*/
function dedent(text: string): string {
  const trimmed = text.replace(/^\n+|\n+$/g, "");
  const lines = trimmed.split("\n");
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^\s*/)?.[0].length ?? 0);

  if (indents.length === 0) {
    return trimmed;
  }

  const commonIndent = Math.min(...indents);
  return lines.map((line) => line.slice(commonIndent)).join("\n");
}

/*
  Runs requirement checks with Open Code via AI SDK structured output.
*/
export async function runLlmJudge(options: {
  workspacePath: string;
}): Promise<JudgeRunResult> {
  const { workspacePath } = options;
  const requirements = await loadRequirements(workspacePath);
  if (!requirements) {
    return {
      runner: "llm-judge",
      status: "skipped",
      requirement_results: [],
      error: "requirements.yaml not found",
    };
  }

  const missingFiles = await collectMissingFiles(workspacePath, requirements);
  if (missingFiles.length > 0) {
    return {
      runner: "llm-judge",
      status: "error",
      requirement_results: [],
      error: `missing input files: ${missingFiles.join(", ")}`,
      requirements_path: path.join(workspacePath, "requirements.yaml"),
    };
  }

  const files = await loadJudgeInputFiles(workspacePath, requirements);
  const prompt = buildJudgePrompt(requirements, files);
  const promptPath = path.join(workspacePath, "judge-prompt.txt");
  const outputPath = path.join(workspacePath, "judge-output.txt");
  await writeFile(promptPath, prompt, "utf8");

  let structuredOutput: JudgeOutput;
  try {
    structuredOutput = await runOpenCodeHarnessJudge({
      workspacePath,
      prompt,
      timeoutMs: OPEN_CODE_HARNESS_TIMEOUT_MS,
      modelId: OPEN_CODE_HARNESS_MODEL,
    });
  } catch (error) {
    return {
      runner: "llm-judge",
      status: "error",
      requirement_results: [],
      requirements_path: path.join(workspacePath, "requirements.yaml"),
      prompt_path: promptPath,
      output_path: outputPath,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  await writeFile(
    outputPath,
    JSON.stringify(structuredOutput, null, 2),
    "utf8",
  );

  const requirementResults = mapRequirementResults(
    requirements.requirements,
    structuredOutput.requirements,
  );
  const status = requirementResults.every((item) => item.passed)
    ? "pass"
    : "fail";

  return {
    runner: "llm-judge",
    status,
    requirement_results: requirementResults,
    summary: structuredOutput.summary,
    requirements_path: path.join(workspacePath, "requirements.yaml"),
    prompt_path: promptPath,
    output_path: outputPath,
  };
}

/*
  Maps raw judge rows back to declared requirements with defaults.
*/
function mapRequirementResults(
  requirements: Requirement[],
  rows: JudgeOutput["requirements"],
): RequirementResult[] {
  const byId = new Map(rows.map((row) => [row.id, row]));

  return requirements.map((requirement) => {
    const row = byId.get(requirement.id);
    if (!row) {
      return {
        id: requirement.id,
        description: requirement.description,
        weight: requirement.weight,
        passed: false,
        reason: "judge did not return a result for this requirement",
        evidence: [],
      };
    }

    return {
      id: requirement.id,
      description: requirement.description,
      weight: requirement.weight,
      passed: row.passed,
      reason: row.reason,
      evidence: row.evidence,
      confidence: row.confidence,
    };
  });
}

/*
  Collects requirement input files that are missing in the workspace.
*/
async function collectMissingFiles(
  workspacePath: string,
  requirements: RequirementsDefinition,
): Promise<string[]> {
  const missing: string[] = [];
  for (const filePath of requirements.inputs.files) {
    try {
      await access(path.join(workspacePath, filePath));
    } catch {
      missing.push(filePath);
    }
  }
  return missing;
}

/*
  Loads and truncates configured input files for prompt construction.
*/
async function loadJudgeInputFiles(
  workspacePath: string,
  requirements: RequirementsDefinition,
): Promise<Array<{ path: string; content: string; truncated: boolean }>> {
  const results: Array<{ path: string; content: string; truncated: boolean }> =
    [];

  for (const relativePath of requirements.inputs.files) {
    const absolutePath = path.join(workspacePath, relativePath);
    const raw = await readFile(absolutePath, "utf8");
    const truncated = raw.length > DEFAULT_INPUT_FILE_MAX_CHARS;

    results.push({
      path: relativePath,
      content: truncated ? raw.slice(0, DEFAULT_INPUT_FILE_MAX_CHARS) : raw,
      truncated,
    });
  }

  return results;
}

/*
  Builds the judging prompt from requirements and file snapshots.
*/
function buildJudgePrompt(
  requirements: RequirementsDefinition,
  files: Array<{ path: string; content: string; truncated: boolean }>,
): string {
  const requirementsBlock = requirements.requirements
    .map((item) => `- ${item.id}: ${item.description}`)
    .join("\n");

  const filesBlock = files
    .map((file) => {
      const lines = [
        `### FILE: ${file.path}`,
        file.truncated
          ? `NOTE: content truncated to ${DEFAULT_INPUT_FILE_MAX_CHARS} characters.`
          : "",
        "```",
        file.content,
        "```",
      ].filter(Boolean);
      return lines.join("\n");
    })
    .join("\n\n");

  return dedent(`
    Evaluate the implementation against the requirements.
    Use only the provided files as evidence.
    Mark a requirement as failed when evidence is missing or contradictory.

    Requirements:
    ${requirementsBlock}

    Provided files:
    ${filesBlock}
  `);
}

/*
  Executes the Open Code judge with structured output parsing.
*/
async function runOpenCodeHarnessJudge(options: {
  workspacePath: string;
  prompt: string;
  timeoutMs: number;
  modelId: string;
}): Promise<JudgeOutput> {
  const provider = createOpencode({
    port: OPEN_CODE_HARNESS_PORT,
    autoStartServer: true,
    serverTimeout: options.timeoutMs,
    defaultSettings: {
      cwd: options.workspacePath,
      logger: false,
    },
  });

  const result = await generateText({
    model: provider(options.modelId),
    prompt: options.prompt,
    output: Output.object({
      schema: judgeOutputSchema,
      name: "eval_requirements_result",
      description: "Requirement verdicts for the evaluated React Native task",
    }),
  });

  return result.output;
}
