import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

type Report = {
  run_id: string;
  created_at: string;
  results: Array<Record<string, unknown>>;
};

/*
  Writes the aggregate results report to disk.
*/
export async function writeReport(
  reportPath: string,
  report: Report,
): Promise<void> {
  const resolvedPath = path.isAbsolute(reportPath)
    ? reportPath
    : path.join(process.cwd(), reportPath);
  await mkdir(path.dirname(resolvedPath), { recursive: true });
  await writeFile(resolvedPath, JSON.stringify(report, null, 2), "utf8");
}
