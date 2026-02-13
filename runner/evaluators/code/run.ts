import path from 'node:path'
import * as ts from 'typescript'

import type { LoadedFile } from 'runner/utils/fs'

type CommandCheck = {
  passed: boolean
  exitCode: number
  output: string
  errorCount: number
  warningCount: number
}

export type CodeEvaluatorResult = {
  cyclomaticComplexity: {
    total: number
    averagePerFile: number
    byFile: Array<{
      path: string
      complexity: number
    }>
  }
  eslint: CommandCheck
  tsc: CommandCheck
}

function roundTo(value: number, decimals: number) {
  const scale = 10 ** decimals
  return Math.round(value * scale) / scale
}

function detectScriptKind(filePath: string) {
  const extension = path.extname(filePath).toLowerCase()

  if (extension === '.tsx') {
    return ts.ScriptKind.TSX
  }
  if (extension === '.jsx') {
    return ts.ScriptKind.JSX
  }
  if (extension === '.ts') {
    return ts.ScriptKind.TS
  }
  return ts.ScriptKind.JS
}

function calculateCyclomaticComplexity(filePath: string, content: string) {
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    detectScriptKind(filePath)
  )
  let complexity = 1

  function visit(node: ts.Node) {
    if (
      ts.isIfStatement(node) ||
      ts.isConditionalExpression(node) ||
      ts.isForStatement(node) ||
      ts.isForInStatement(node) ||
      ts.isForOfStatement(node) ||
      ts.isWhileStatement(node) ||
      ts.isDoStatement(node) ||
      ts.isCatchClause(node)
    ) {
      complexity += 1
    }

    if (ts.isCaseClause(node)) {
      complexity += 1
    }

    if (ts.isBinaryExpression(node)) {
      const operator = node.operatorToken.kind
      if (
        operator === ts.SyntaxKind.AmpersandAmpersandToken ||
        operator === ts.SyntaxKind.BarBarToken ||
        operator === ts.SyntaxKind.QuestionQuestionToken ||
        operator === ts.SyntaxKind.AmpersandAmpersandEqualsToken ||
        operator === ts.SyntaxKind.BarBarEqualsToken ||
        operator === ts.SyntaxKind.QuestionQuestionEqualsToken
      ) {
        complexity += 1
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return complexity
}

async function runCommand(command: string[], cwd?: string) {
  const processHandle = Bun.spawn(command, {
    cwd,
    stdout: 'pipe',
    stderr: 'pipe',
  })

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(processHandle.stdout).text(),
    new Response(processHandle.stderr).text(),
    processHandle.exited,
  ])

  const trimmedStdout = stdout.trim()
  const trimmedStderr = stderr.trim()
  const output = [trimmedStdout, trimmedStderr].filter(Boolean).join('\n')

  return {
    passed: exitCode === 0,
    exitCode,
    stdout: trimmedStdout,
    stderr: trimmedStderr,
    output,
  }
}

function parseEslintCounts(stdout: string, output: string, exitCode: number) {
  try {
    const parsed = JSON.parse(stdout) as Array<{
      errorCount?: number
      warningCount?: number
      fatalErrorCount?: number
    }>
    const totals = parsed.reduce<{ errorCount: number; warningCount: number }>(
      (accumulator, fileResult) => {
        return {
          errorCount:
            accumulator.errorCount +
            (fileResult.errorCount ?? 0) +
            (fileResult.fatalErrorCount ?? 0),
          warningCount: accumulator.warningCount + (fileResult.warningCount ?? 0),
        }
      },
      { errorCount: 0, warningCount: 0 }
    )

    if (
      exitCode !== 0 &&
      totals.errorCount === 0 &&
      totals.warningCount === 0
    ) {
      return { errorCount: 1, warningCount: 0 }
    }

    return totals
  } catch {
    const summaryMatch = output.match(
      /(\d+)\s+problems?\s+\((\d+)\s+errors?,\s+(\d+)\s+warnings?\)/i
    )
    if (!summaryMatch) {
      if (exitCode !== 0) {
        return { errorCount: 1, warningCount: 0 }
      }
      return { errorCount: 0, warningCount: 0 }
    }

    return {
      errorCount: parseInt(summaryMatch[2] || '0', 10),
      warningCount: parseInt(summaryMatch[3] || '0', 10),
    }
  }
}

function parseTscCounts(output: string, exitCode: number) {
  const errorSummary = output.match(/Found\s+(\d+)\s+errors?/i)
  const warningSummary = output.match(/Found\s+(\d+)\s+warnings?/i)

  const fallbackErrorMatches = output.match(/error TS\d+:/g) ?? []
  const fallbackWarningMatches = output.match(/warning TS\d+:/g) ?? []

  const counts = {
    errorCount: errorSummary
      ? parseInt(errorSummary[1] || '0', 10)
      : fallbackErrorMatches.length,
    warningCount: warningSummary
      ? parseInt(warningSummary[1] || '0', 10)
      : fallbackWarningMatches.length,
  }

  if (exitCode !== 0 && counts.errorCount === 0 && counts.warningCount === 0) {
    return { errorCount: 1, warningCount: 0 }
  }

  return counts
}

function formatEslintOutput(stdout: string, stderr: string, fallback: string) {
  try {
    const parsed = JSON.parse(stdout)
    const prettyJson = JSON.stringify(parsed, null, 2)
    return [prettyJson, stderr].filter(Boolean).join('\n')
  } catch {
    return fallback
  }
}

/*
  Evaluates generated source with static code checks and complexity metrics.
 */
export async function runCodeEvaluatorStage(
  generatedFiles: LoadedFile[],
  generatedDirectory: string
): Promise<CodeEvaluatorResult> {
  const sourceFiles = generatedFiles.filter((file) =>
    /\.(ts|tsx|js|jsx)$/.test(file.absolutePath)
  )
  const sourceFilePaths = sourceFiles.map((file) => file.absolutePath)
  const relativeSourceFilePaths = sourceFiles.map((file) =>
    path.relative(generatedDirectory, file.absolutePath).split(path.sep).join('/')
  )

  const complexityByFile = sourceFiles.map((file) => ({
    path: path
      .relative(generatedDirectory, file.absolutePath)
      .split(path.sep)
      .join('/'),
    complexity: calculateCyclomaticComplexity(file.absolutePath, file.content),
  }))
  const totalComplexity = complexityByFile.reduce(
    (sum, fileComplexity) => sum + fileComplexity.complexity,
    0
  )

  const eslintRaw =
    sourceFilePaths.length === 0
      ? {
          passed: true,
          exitCode: 0,
          stdout: '',
          stderr: '',
          output: 'skipped: no source files',
        }
      : await runCommand([
          'bunx',
          'eslint',
          '--config',
          'eslint.config.mjs',
          '--format',
          'json',
          ...relativeSourceFilePaths,
        ], generatedDirectory)
  const eslintCounts = parseEslintCounts(
    eslintRaw.stdout,
    eslintRaw.output,
    eslintRaw.exitCode
  )
  const eslint = {
    passed: eslintRaw.passed,
    exitCode: eslintRaw.exitCode,
    output: formatEslintOutput(
      eslintRaw.stdout,
      eslintRaw.stderr,
      eslintRaw.output
    ),
    errorCount: eslintCounts.errorCount,
    warningCount: eslintCounts.warningCount,
  }

  const tscRaw =
    sourceFilePaths.length === 0
      ? {
          passed: true,
          exitCode: 0,
          stdout: '',
          stderr: '',
          output: 'skipped: no source files',
        }
      : await runCommand([
          'bunx',
          'tsc',
          '--project',
          'tsconfig.json',
          '--pretty',
          'false',
          '--noEmit',
        ], generatedDirectory)
  const tscCounts = parseTscCounts(tscRaw.output, tscRaw.exitCode)
  const tsc = {
    passed: tscRaw.passed,
    exitCode: tscRaw.exitCode,
    output: tscRaw.output,
    errorCount: tscCounts.errorCount,
    warningCount: tscCounts.warningCount,
  }

  return {
    cyclomaticComplexity: {
      total: totalComplexity,
      averagePerFile:
        sourceFiles.length === 0
          ? 0
          : roundTo(totalComplexity / sourceFiles.length, 4),
      byFile: complexityByFile,
    },
    eslint,
    tsc,
  }
}
