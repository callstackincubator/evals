import { requireNativeModule } from 'expo-modules-core'

export type DeviceAuditModule = {
  getBatteryLabelAsync(): Promise<string>
}

export const DeviceAudit = requireNativeModule<DeviceAuditModule>('DeviceAudit')
