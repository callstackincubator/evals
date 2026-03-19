import React from 'react'
import {
  Platform,
  Text,
  View,
} from 'react-native'

const subtitleFontSize = Platform.select({
  android: 12,
  default: 8,
  ios: 10,
})

export default function App() {
  return (
    <View>
      <Text style={{ fontSize: subtitleFontSize }}>Summary</Text>
    </View>
  )
}
