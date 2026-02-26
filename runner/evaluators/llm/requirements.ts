import YAML from 'yaml'
import { z } from 'zod'

const requirementSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  weight: z.number().positive().optional(),
})

const requirementsSchema = z.object({
  version: z.number().int().positive().default(1),
  requirements: z.array(requirementSchema).min(1),
})

export type RequirementDefinition = z.infer<typeof requirementSchema>
export type RequirementsDefinition = z.infer<typeof requirementsSchema>

function quoteUnsafeDescriptionLines(raw: string) {
  return raw
    .split('\n')
    .map((line) => {
      const match = line.match(/^(\s*description:\s*)(.*)$/)
      if (!match) return line

      const [, prefix, value = ''] = match
      const trimmed = value.trimStart()

      if (
        trimmed.length === 0 ||
        trimmed.startsWith('"') ||
        trimmed.startsWith("'") ||
        trimmed.startsWith('|') ||
        trimmed.startsWith('>')
      ) {
        return line
      }

      return `${prefix}${JSON.stringify(value)}`
    })
    .join('\n')
}

/*
  Loads and validates one requirements.yaml file using the runtime schema.
 */
export async function loadRequirements(raw: string) {
  const normalizedRaw = quoteUnsafeDescriptionLines(raw)

  let parsed: unknown
  try {
    parsed = YAML.parse(normalizedRaw)
  } catch (normalizedError) {
    if (normalizedRaw === raw) {
      throw normalizedError
    }

    parsed = YAML.parse(raw)
  }

  return requirementsSchema.parse(parsed).requirements
}
