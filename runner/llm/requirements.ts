import { readFile } from 'node:fs/promises'
import YAML from 'yaml'
import { z } from 'zod'

const requirementSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  weight: z.number().positive().optional(),
})

const requirementsSchema = z.object({
  version: z.number().int().positive().default(1),
  inputs: z
    .object({
      files: z.array(z.string().min(1)).min(1),
    })
    .default({
      files: ['app/App.tsx', 'app/package.json'],
    }),
  requirements: z.array(requirementSchema).min(1),
})

export type RequirementDefinition = z.infer<typeof requirementSchema>
export type RequirementsDefinition = z.infer<typeof requirementsSchema>

/*
  Loads and validates one requirements.yaml file using the runtime schema.
 */
export async function loadRequirements(requirementsPath: string) {
  const raw = await readFile(requirementsPath, 'utf8')
  const parsed = YAML.parse(raw)
  return requirementsSchema.parse(parsed)
}
