import type { Workspace } from "../workspace";

export type RunnerResult = {
  status: "pass" | "fail" | "error" | "skipped";
  [key: string]: unknown;
};

export type RunnerContext = {
  workspace: Workspace;
  evalId: string;
  debug: boolean;
};
