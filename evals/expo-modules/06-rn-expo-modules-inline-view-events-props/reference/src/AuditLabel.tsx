import { requireNativeViewManager } from 'expo-modules-core'

type Props = {
  title: string
  onReady?: () => void
}

export default requireNativeViewManager<Props>('AuditLabel')
