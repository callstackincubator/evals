import { Text, View } from 'react-native'

export function SuspenseFallback() {
  return <Text>Loading route...</Text>
}

export default function Index() {
  return (
    <View>
      <Text>Async route content</Text>
    </View>
  )
}
