import { requireNativeModule } from 'expo-modules-core'

export type AuditModule = {
  getPlatform(): string
}

export default requireNativeModule<AuditModule>('AuditModule')
