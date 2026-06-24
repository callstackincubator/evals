import { useLocalSearchParams } from 'expo-router'
import { Text, View } from 'react-native'

export default function Details() {
  const { id, tab } = useLocalSearchParams<{ id?: string; tab?: string }>()
  return <View><Text>{String(id ?? 'missing')} - {String(tab ?? 'overview')}</Text></View>
}
