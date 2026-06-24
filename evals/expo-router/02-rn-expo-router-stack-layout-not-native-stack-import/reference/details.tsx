import { useLocalSearchParams } from 'expo-router'
import { Text, View } from 'react-native'

export default function Details() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  return <View><Text>Product {id ?? 'unknown'}</Text></View>
}
