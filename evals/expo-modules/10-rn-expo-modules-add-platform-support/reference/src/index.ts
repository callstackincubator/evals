import { requireNativeModule } from 'expo-modules-core'

type AuditModule = {
  getPlatform(): string
}

export default requireNativeModule<AuditModule>('AuditModule')
