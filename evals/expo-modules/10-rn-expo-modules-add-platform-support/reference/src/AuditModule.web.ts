import type { AuditModule } from './AuditModule'

const AuditModuleWeb: AuditModule = {
  getPlatform() {
    return 'web'
  },
}

export default AuditModuleWeb
