import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const categoryConfigs = [
  {
    id: "animation",
    name: "Animation",
    iconKey: "film-slate",
    order: 1,
    evalCount: 16,
    difficulty: -0.02,
    callstackBoost: 0.11,
  },
  {
    id: "async-state",
    name: "Async State",
    iconKey: "arrows-clockwise",
    order: 2,
    evalCount: 16,
    difficulty: -0.03,
    callstackBoost: 0.09,
  },
  {
    id: "permissions",
    name: "Permissions",
    iconKey: "shield-check",
    order: 3,
    evalCount: 24,
    difficulty: -0.01,
    callstackBoost: 0.07,
  },
  {
    id: "lists",
    name: "Lists",
    iconKey: "list-bullets",
    order: 4,
    evalCount: 18,
    difficulty: 0,
    callstackBoost: 0.06,
  },
  {
    id: "navigation",
    name: "Navigation",
    iconKey: "compass",
    order: 5,
    evalCount: 50,
    difficulty: -0.04,
    callstackBoost: 0.12,
  },
  {
    id: "storage",
    name: "Storage",
    iconKey: "database",
    order: 6,
    evalCount: 18,
    difficulty: -0.02,
    callstackBoost: 0.08,
  },
];

const requirementTemplates = [
  "Implements the core scenario without runtime errors.",
  "Handles loading and idle states correctly.",
  "Displays expected UI feedback for user actions.",
  "Maintains predictable state transitions.",
  "Avoids unnecessary re-renders in typical usage.",
  "Handles edge cases and invalid inputs gracefully.",
  "Preserves behavior across Android and iOS parity checks.",
  "Keeps side effects isolated and cancelable.",
  "Includes clear error handling and fallback UI.",
  "Respects accessibility and keyboard interaction basics.",
];

const evalNameTokens = [
  "baseline-scenario",
  "edge-case-path",
  "stress-flow",
  "interaction-loop",
  "resilience-check",
  "state-sync",
  "latency-guard",
  "regression-watch",
  "ui-feedback",
  "recovery-path",
];

const modelConfigs = [
  { id: "gpt-5", label: "GPT-5", base: 0.83 },
  { id: "claude-opus-4", label: "Claude Opus 4", base: 0.8 },
  { id: "claude-sonnet-4", label: "Claude Sonnet 4", base: 0.77 },
  { id: "gpt-4-1", label: "GPT-4.1", base: 0.75 },
  { id: "gemini-2-5-pro", label: "Gemini 2.5 Pro", base: 0.72 },
  { id: "deepseek-r1", label: "DeepSeek R1", base: 0.68 },
  { id: "qwen-3-coder", label: "Qwen 3 Coder", base: 0.63 },
  { id: "llama-4-maverick", label: "Llama 4 Maverick", base: 0.59 },
];

const modelCategoryBias = {
  "gpt-5": {
    navigation: 0.03,
    animation: 0.02,
    storage: -0.03,
  },
  "claude-opus-4": {
    permissions: 0.06,
    "async-state": 0.04,
    navigation: -0.02,
  },
  "claude-sonnet-4": {
    lists: 0.06,
    storage: 0.04,
    animation: -0.02,
  },
  "gpt-4-1": {
    animation: 0.05,
    navigation: 0.01,
    permissions: -0.03,
  },
  "gemini-2-5-pro": {
    storage: 0.07,
    "async-state": 0.03,
    navigation: -0.03,
  },
  "deepseek-r1": {
    lists: 0.07,
    permissions: 0.02,
    animation: -0.04,
  },
  "qwen-3-coder": {
    "async-state": 0.08,
    storage: 0.05,
    navigation: -0.05,
  },
  "llama-4-maverick": {
    animation: 0.09,
    lists: 0.03,
    navigation: -0.06,
  },
};

function hashToUnit(input) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) / 0xffffffff;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function buildCatalog() {
  return {
    version: "1.0.0",
    categories: categoryConfigs.map((category) => ({
      id: category.id,
      name: category.name,
      iconKey: category.iconKey,
      order: category.order,
      evals: Array.from({ length: category.evalCount }, (_, index) => {
        const evalIndex = index + 1;
        const evalId = `${category.id}-${String(evalIndex).padStart(2, "0")}`;
        const token = evalNameTokens[(evalIndex + category.order) % evalNameTokens.length];
        const requirementCount = 3 + ((evalIndex * 3 + category.order * 5) % 8);

        return {
          id: evalId,
          name: `${String(evalIndex).padStart(2, "0")} ${token}`,
          prompt: `Build a React Native ${category.name.toLowerCase()} solution for ${token.replaceAll("-", " ")}. Include reliable error handling and production-safe behavior.`,
          requirements: Array.from({ length: requirementCount }, (_, reqIndex) => {
            const requirementId = `r${reqIndex + 1}`;
            const template =
              requirementTemplates[
                (reqIndex + evalIndex + category.order) % requirementTemplates.length
              ];

            return {
              id: requirementId,
              text: template,
            };
          }),
        };
      }),
    })),
  };
}

function buildModelResults(catalog) {
  return {
    version: "1.0.0",
    generatedAt: "2026-02-27T12:00:00.000Z",
    sourceRepoUrl: "https://github.com/callstack/rn-evals-results",
    models: modelConfigs.map((model) => ({
      id: model.id,
      label: model.label,
      variants: {
        vanilla: {
          evalResults: buildEvalResultsForVariant(catalog, model, "vanilla"),
        },
        callstack: {
          evalResults: buildEvalResultsForVariant(catalog, model, "callstack"),
        },
      },
    })),
  };
}

function buildEvalResultsForVariant(catalog, model, variant) {
  return catalog.categories.flatMap((category) => {
    const categoryConfig = categoryConfigs.find((item) => item.id === category.id);
    const modelBias = modelCategoryBias[model.id]?.[category.id] ?? 0;

    return category.evals.map((evalDef) => {
      const categoryOffset = (hashToUnit(`${model.id}|${category.id}`) - 0.5) * 0.22;
      const evalOffset = (hashToUnit(evalDef.id) - 0.5) * 0.16;
      const callstackBoost = variant === "callstack" ? categoryConfig.callstackBoost : 0;
      const callstackModelOffset =
        variant === "callstack" ? (hashToUnit(`cs|${model.id}|${category.id}`) - 0.5) * 0.04 : 0;

      const passProbability = clamp(
        model.base +
          categoryConfig.difficulty +
          modelBias +
          categoryOffset +
          evalOffset +
          callstackBoost +
          callstackModelOffset,
        0.06,
        0.98,
      );

      return {
        evalId: evalDef.id,
        requirementResults: evalDef.requirements.map((requirement) => {
          const sample = hashToUnit(`${model.id}|${variant}|${evalDef.id}|${requirement.id}`);

          return {
            requirementId: requirement.id,
            status: sample <= passProbability ? "pass" : "fail",
          };
        }),
      };
    });
  });
}

function writeJson(relativePath, data) {
  const fullPath = resolve(process.cwd(), relativePath);
  writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function main() {
  mkdirSync(resolve(process.cwd(), "data"), { recursive: true });

  const catalog = buildCatalog();
  const modelResults = buildModelResults(catalog);

  writeJson("data/eval-catalog.json", catalog);
  writeJson("data/model-results.json", modelResults);

  const counts = Object.fromEntries(
    catalog.categories.map((category) => [category.id, category.evals.length]),
  );

  console.log("Generated catalog and results.");
  console.log("Category eval counts:", counts);
}

main();
