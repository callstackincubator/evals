import type { RequirementDefinition } from './requirements'
import type { LoadedFile } from 'runner/utils/fs'

/*
  Builds a judge prompt from requirements and generated source files.

  The judge grades each requirement on a graded 0..1 scale (partial credit)
  against the requirement's underlying intent. Functionally correct, idiomatic
  React Native implementations are credited even when they reach the goal via a
  different API than a requirement happens to name, so the score reflects code
  quality rather than literal pattern matching.
*/
export function buildJudgePrompt(
  requirements: RequirementDefinition[],
  files: LoadedFile[]
) {
  const requirementsBlock = requirements
    .map((requirement) => {
      return `
        <requirement>
          <id>${requirement.id}</id>
          <weight>${requirement.weight}</weight>
          <description>${requirement.description}</description>
        </requirement>
      `
    })
    .join('\n\n')

  const filesBlock = files
    .map((file) => {
      return `
        <file path="${file.path}">
${file.content}
        </file>
      `
    })
    .join('\n\n')

  return `
    You are a senior React Native engineer reviewing a code submission for
    production ("Callstack") quality. Grade how well the submission satisfies
    each acceptance criterion, using only the submitted files as evidence.

    Grade on INTENT, not on literal API names. Each criterion describes a goal
    (a behavior, a correctness property, or an API constraint). A criterion is
    satisfied when the submitted code achieves that goal with correct, idiomatic
    React Native code — regardless of whether it uses the exact API, prop, hook,
    or structural pattern the wording happens to mention.

    Scoring (graded, partial credit) — set "score" in [0, 1] per criterion:
    - 1.0  Goal fully achieved with correct, idiomatic code. Award full credit
           even if a different but valid and idiomatic API/approach is used
           than the one named, as long as the behavior/intent is met.
    - 0.75 Goal achieved but with a minor quality gap (e.g. a small omission,
           slightly non-idiomatic, missing an edge case).
    - 0.5  Goal partially achieved, or achieved with a real correctness/quality
           issue.
    - 0.25 Attempted but largely missing or mostly incorrect.
    - 0.0  Not addressed, or the implementation is genuinely incorrect/broken.

    Crediting alternatives (important — do NOT over-penalize):
    - If the code reaches the criterion's goal with a different idiomatic
      mechanism (e.g. an equivalent animation driver, an equivalent
      navigation/auth pattern, an equivalent state-management approach, a manual
      implementation that is correct and clean), treat the goal as met and score
      it high.
    - Only drive the score down when the goal is genuinely unmet, the code is
      incorrect or buggy, or the criterion is an explicit, justified prohibition
      (e.g. avoid a deprecated/unsafe API for a stated correctness reason) and
      the submission violates it.
    - A different-but-correct choice is NOT a failure. Penalize broken code,
      missing behavior, and non-idiomatic anti-patterns — not valid variety.

    For each criterion return: "id", "score" (0..1), "passed" (true when
    score >= 0.5), a concise "reason" naming the concrete evidence, and
    "evidence" (short code/path snippets). Set "confidence" in [0, 1].

    Also return an overall "codeQuality" judgment for the whole submission:
    a "score" in [0, 1] for how idiomatic, correct, and production-ready the
    React Native code is, with short "notes". This measures craft, not literal
    criterion matching.

    Rules:
    - Use only the submitted files as evidence; reference file paths in reasons.
    - Return exactly one result per declared requirement id.

    Acceptance criteria:
    <requirements>
      ${requirementsBlock}
    </requirements>

    Submitted files:
    <files>
      ${filesBlock}
    </files>
  `
}
