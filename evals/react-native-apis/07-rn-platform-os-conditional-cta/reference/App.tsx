import React from 'react'
import { Text, View, Platform } from 'react-native'

export default function App() {
  const platform = Platform.OS
  return (
    <View>
      <Text>Platform: {platform}</Text>
    </View>
  )
}
