import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'

const GENERATION_MANIFEST_FILE_NAME = 'manifest.json'

const generationManifestEvalSchema = z.object({
  evalId: z.string().min(1),
  evalPath: z.string().min(1),
  outputFiles: z.array(z.string().min(1)),
  generatedPath: z.string().min(1),
  solverSessionArtifactPath: z.string().min(1),
}).strict()

const generationManifestSchema = z.object({
  runId: z.string().min(1),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime(),
  solverModel: z.string().min(1),
  pattern: z.string().min(1),
  evalCount: z.number().int().nonnegative(),
  evalsProcessed: z.number().int().nonnegative(),
  evalsErrored: z.number().int().nonnegative(),
  evals: z.array(generationManifestEvalSchema),
}).strict()

export type GenerationManifest = z.infer<typeof generationManifestSchema>

export function getGenerationManifestPath(outputDirectory: string) {
  return path.join(outputDirectory, GENERATION_MANIFEST_FILE_NAME)
}

function parseGenerationManifest(input: unknown): GenerationManifest {
  return generationManifestSchema.parse(input)
}

export function stringifyGenerationManifest(input: unknown): string {
  const manifest = parseGenerationManifest(input)
  return JSON.stringify(manifest, null, 2)
}

/*
  Reads and validates generation manifest from disk.
 */
export async function readGenerationManifest(
  outputDirectory: string
): Promise<GenerationManifest> {
  const manifestPath = getGenerationManifestPath(outputDirectory)
  const rawManifest = await readFile(manifestPath, 'utf-8')
  const parsedJson = JSON.parse(rawManifest) as unknown
  return parseGenerationManifest(parsedJson)
}
