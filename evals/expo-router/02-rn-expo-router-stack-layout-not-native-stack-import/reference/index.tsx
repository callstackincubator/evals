import { Link } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'

const PRODUCT = { id: '42', name: 'Aurora Headphones' }

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{PRODUCT.name}</Text>
      <Link href={{ pathname: '/details', params: { id: PRODUCT.id } }}>View details</Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12, padding: 24 },
  title: { fontSize: 20, fontWeight: '600' },
})
