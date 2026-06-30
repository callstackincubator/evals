export type AuditResult = {
  ok: boolean
}

export async function audit(): Promise<AuditResult> {
  return { ok: true }
}
