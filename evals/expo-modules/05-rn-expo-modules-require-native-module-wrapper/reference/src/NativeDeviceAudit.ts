import { requireNativeModule } from 'expo-modules-core'

type DeviceAuditModule = {
  getBatteryLabelAsync(): Promise<string>
}

const NativeDeviceAudit = requireNativeModule<DeviceAuditModule>('DeviceAudit')

export async function getBatteryLabel() {
  return NativeDeviceAudit.getBatteryLabelAsync()
}
