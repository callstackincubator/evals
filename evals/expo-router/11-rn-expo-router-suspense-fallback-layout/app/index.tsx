import { Text, View } from 'react-native'

export function SuspenseFallback() {
  return <Text>Loading...</Text>
}

export default function Index() {
  return (
    <View>
      <Text>Home</Text>
    </View>
  )
}
