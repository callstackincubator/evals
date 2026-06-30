import { useLocalSearchParams } from 'expo-router'
import { Text, View } from 'react-native'

export default function CatchAll() {
  const { slug } = useLocalSearchParams<{ slug?: string[] }>()

  return (
    <View>
      <Text>Docs: {slug?.join('/') ?? 'index'}</Text>
    </View>
  )
}
