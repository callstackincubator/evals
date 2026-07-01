import { use } from 'react'
import { Text, View } from 'react-native'

const contentPromise = new Promise<string>((resolve) =>
  setTimeout(() => resolve('Async route content'), 500),
)

export function SuspenseFallback() {
  return <Text>Loading route...</Text>
}

export default function Index() {
  const content = use(contentPromise)

  return (
    <View>
      <Text>{content}</Text>
    </View>
  )
}
