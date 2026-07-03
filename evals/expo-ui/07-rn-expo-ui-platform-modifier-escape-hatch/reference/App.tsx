import {
  Host as AndroidHost,
  Column as AndroidColumn,
  Text as AndroidText,
} from '@expo/ui/jetpack-compose'
import {
  background as androidBackground,
  clip as androidClip,
  shadow as androidShadow,
  Shapes,
} from '@expo/ui/jetpack-compose/modifiers'
import {
  Host as IOSHost,
  Text as IOSText,
  VStack as IOSVStack,
} from '@expo/ui/swift-ui'
import {
  background as iosBackground,
  cornerRadius as iosCornerRadius,
  shadow as iosShadow,
} from '@expo/ui/swift-ui/modifiers'
import { Platform } from 'react-native'

export default function App() {
  if (Platform.OS === 'ios') {
    return (
      <IOSHost style={{ flex: 1 }}>
        <IOSText>Featured</IOSText>
        <IOSVStack
          modifiers={[
            iosBackground('#ffffff'),
            iosCornerRadius(16),
            iosShadow({ radius: 8, x: 0, y: 2, color: '#00000026' }),
          ]}
        >
          <IOSText>Weekly digest</IOSText>
          <IOSText>Your top stories, every Monday.</IOSText>
        </IOSVStack>
      </IOSHost>
    )
  }

  return (
    <AndroidHost style={{ flex: 1 }}>
      <AndroidText>Featured</AndroidText>
      <AndroidColumn
        modifiers={[
          androidShadow(4),
          androidClip(Shapes.RoundedCorner(4)),
          androidBackground('#ffffff'),
        ]}
      >
        <AndroidText>Weekly digest</AndroidText>
        <AndroidText>Your top stories, every Monday.</AndroidText>
      </AndroidColumn>
    </AndroidHost>
  )
}
