import { useLocalSearchParams } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'

export default function Details() {
  const { id, tab } = useLocalSearchParams<{ id?: string; tab?: string }>()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Details</Text>
      <Text>
        Product {id ?? 'unknown'} — {tab ?? 'overview'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12, padding: 24 },
  title: { fontSize: 20, fontWeight: '600' },
})
