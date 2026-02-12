import { Glob } from 'bun'
import path from 'node:path'

export const DISCOVERY_ROOT_DIR = 'evals'
export const DISCOVERY_PATTERN = '**/requirements.yaml'

function toPosix(value: string): string {
  return value.replace(/\\/g, '/')
}

/*
  Discovers eval directories by scanning for requirements.yaml files.
 */
export async function discoverEvals(pattern = DISCOVERY_PATTERN) {
  const rootDir = path.resolve(process.cwd(), DISCOVERY_ROOT_DIR)
  const cwd = process.cwd()
  const glob = new Glob(pattern)
  const matchingRequirements: string[] = []

  for await (const filePath of glob.scan({
    cwd: rootDir,
    absolute: true,
    onlyFiles: true,
  })) {
    matchingRequirements.push(filePath)
  }

  return matchingRequirements
    .map((requirementsPath) => {
      const evalPath = path.dirname(requirementsPath)
      return {
        evalId: path.basename(evalPath),
        evalPath,
        requirementsPath,
        relativeRequirementsPath: toPosix(path.relative(cwd, requirementsPath)),
      }
    })
    .sort((left, right) => left.relativeRequirementsPath.localeCompare(right.relativeRequirementsPath))
}
