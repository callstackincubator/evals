import { requireNativeViewManager } from 'expo-modules-core'

// Minimal native view wrapper. Props and events are not yet typed or
// forwarded from the native module definition.
const NativeAuditLabel = requireNativeViewManager('AuditLabel')

export default NativeAuditLabel
