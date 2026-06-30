import { NativeModulesProxy } from 'expo-modules-core'

// Untyped access to the native module. Consumers reach into this proxy
// directly, so there is no type safety on the function surface.
export const DeviceAudit = NativeModulesProxy.DeviceAudit
