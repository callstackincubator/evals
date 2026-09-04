import path from 'node:path'
import ts from 'typescript'

import { discoverEvals } from '../runner/utils/discovery'

/*
  Each eval declares its own global type augmentations (e.g. react-navigation's
  `declare global { namespace ReactNavigation { interface RootParamList ... } } }`).
  Compiling every eval into one shared tsc program merges those global interfaces
  across unrelated evals and produces false conflicts. So instead of one program
  for all of evals/, this creates one isolated program per eval directory,
  sharing a single compiler host so common files (react-native types, lib.d.ts,
  ...) are only parsed once.
 */

const CONFIG_PATH = path.join(process.cwd(), 'evals/tsconfig.json')

const formatHost: ts.FormatDiagnosticsHost = {
  getCurrentDirectory: () => process.cwd(),
  getCanonicalFileName: (fileName) => fileName,
  getNewLine: () => ts.sys.newLine,
}

function loadProgramInputs() {
  const configFile = ts.readConfigFile(CONFIG_PATH, ts.sys.readFile)

  if (configFile.error) {
    console.error(ts.formatDiagnostic(configFile.error, formatHost))
    process.exit(1)
  }

  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(CONFIG_PATH)
  )

  if (parsed.errors.length > 0) {
    console.error(ts.formatDiagnostics(parsed.errors, formatHost))
    process.exit(1)
  }

  return {
    fileNames: parsed.fileNames.map((f) => path.resolve(f)),
    options: parsed.options,
  }
}

function createSharedHost(options: ts.CompilerOptions) {
  const host = ts.createCompilerHost(options)
  const sourceFileCache = new Map<string, ts.SourceFile | undefined>()
  const originalGetSourceFile = host.getSourceFile.bind(host)

  host.getSourceFile = (
    fileName,
    languageVersionOrOptions,
    onError,
    shouldCreateNewSourceFile
  ) => {
    if (!shouldCreateNewSourceFile && sourceFileCache.has(fileName)) {
      return sourceFileCache.get(fileName)
    }

    const sourceFile = originalGetSourceFile(
      fileName,
      languageVersionOrOptions,
      onError,
      shouldCreateNewSourceFile
    )
    sourceFileCache.set(fileName, sourceFile)
    return sourceFile
  }

  return host
}

async function main() {
  const { fileNames, options } = loadProgramInputs()
  const evals = await discoverEvals()
  const host = createSharedHost(options)

  const filesByEval = new Map<string, string[]>()

  for (const fileName of fileNames) {
    const owner = evals.find((evalEntry) =>
      fileName.startsWith(evalEntry.evalPath + path.sep)
    )

    if (!owner) {
      continue
    }

    const files = filesByEval.get(owner.evalId) ?? []
    files.push(fileName)
    filesByEval.set(owner.evalId, files)
  }

  let checkedCount = 0
  let failedCount = 0

  for (const evalEntry of evals) {
    const files = filesByEval.get(evalEntry.evalId)

    if (!files || files.length === 0) {
      continue
    }

    checkedCount += 1

    const program = ts.createProgram({ rootNames: files, options, host })
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .filter((diagnostic) => diagnostic.file !== undefined)

    if (diagnostics.length > 0) {
      failedCount += 1
      console.error(`\n${evalEntry.evalId}`)
      console.error(
        ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost)
      )
    }
  }

  console.log(
    `\ntypecheck:evals — ${checkedCount - failedCount}/${checkedCount} evals passed`
  )

  if (failedCount > 0) {
    process.exit(1)
  }
}

main()
