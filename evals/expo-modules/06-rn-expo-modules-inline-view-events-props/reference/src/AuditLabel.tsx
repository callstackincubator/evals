import { requireNativeViewManager } from 'expo-modules-core'
import type { StyleProp, ViewStyle } from 'react-native'

type Props = {
  title: string
  onReady?: () => void
  style?: StyleProp<ViewStyle>
}

export default requireNativeViewManager<Props>('AuditLabel')
