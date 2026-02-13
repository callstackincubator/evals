// 
// Will bring it back.
// 

// function formatTableCell(value: string, width: number) {
//   return value.padEnd(width, ' ')
// }

// function formatIssueCounts(errorCount: number, warningCount: number) {
//   return `❌ ${errorCount} ⚠️  ${warningCount}`
// }

// export function printResultsReportTable(evalResults) {
//   if (evalResults.length === 0) {
//     return
//   }

//   const headers = ['eval', 'llm', 'ESLint', 'TSC', 'Cycl. Compl.', 'err']

//   const rows = evalResults.map((result) => {
//     const eslintCell =
//       result.code === undefined
//         ? 'n/a'
//         : formatIssueCounts(
//             result.code.eslint.errorCount,
//             result.code.eslint.warningCount
//           )

//     const tscCell =
//       result.code === undefined
//         ? 'n/a'
//         : formatIssueCounts(
//             result.code.tsc.errorCount,
//             result.code.tsc.warningCount
//           )

//     const complexityCell =
//       result.code === undefined
//         ? 'n/a'
//         : String(result.code.cyclomaticComplexity.total)

//     return [
//       result.evalId,
//       result.score.ratio.toFixed(4),
//       eslintCell,
//       tscCell,
//       complexityCell,
//       String(result.errors.length),
//     ]
//   })

//   const widths = headers.map((header, index) => {
//     const maxCellWidth = rows.reduce((maxWidth, row) => {
//       return Math.max(maxWidth, row[index]?.length ?? 0)
//     }, 0)
//     return Math.max(header.length, maxCellWidth)
//   })

//   const headerRow = headers
//     .map((header, index) =>
//       formatTableCell(header, widths[index] ?? header.length)
//     )
//     .join(' | ')
//   const divider = widths.map((width) => '-'.repeat(width)).join('-|-')

//   console.log('\nresults table')
//   console.log(headerRow)
//   console.log(divider)
//   for (const row of rows) {
//     console.log(
//       row
//         .map((cell, index) =>
//           formatTableCell(cell, widths[index] ?? cell.length)
//         )
//         .join(' | ')
//     )
//   }
//   console.log('')
// }
