import React from 'react'
import {
  Image,
  Text,
  View,
} from 'react-native'

export default function App() {
  return (
    <View>
      <Text>Story</Text>
      <Image source={{ uri: "https://placehold.co/200x100.png" }} style={{ width: 200, height: 100 }} />
    </View>
  )
}
