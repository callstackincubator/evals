import { StyleSheet, Text, View } from 'react-native'

export default function Details() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Details</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12, padding: 24 },
  title: { fontSize: 20, fontWeight: '600' },
})
