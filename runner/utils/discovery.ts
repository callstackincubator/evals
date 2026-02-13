import { Glob } from 'bun'
import path from 'node:path'

export const DISCOVERY_PATTERN = 'evals/**'

export type Eval = {
  evalId: string
  evalPath: string
}

/*
  Discovers eval directories by scanning for requirements.yaml files.
 */
export async function discoverEvals(pattern = DISCOVERY_PATTERN): Promise<Eval[]> {
  const cwd = process.cwd()
  const glob = new Glob(path.join(pattern, 'requirements.yaml'))
  const matchingRequirements: string[] = []

  for await (const filePath of glob.scan({
    onlyFiles: true,
  })) {
    matchingRequirements.push(filePath)
  }

  return matchingRequirements
    .map((requirementsPath) => {
      const evalPath = path.dirname(requirementsPath)
      return {
        evalId: path.basename(evalPath),
        evalPath: path.join(cwd, evalPath),
      }
    })
    .sort((left, right) => left.evalId.localeCompare(right.evalId))
}
