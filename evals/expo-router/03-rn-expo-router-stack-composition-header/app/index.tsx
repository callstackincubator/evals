import { StyleSheet, Text, View } from 'react-native'

export default function Index() {
  const handleCreate = () => {}

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inbox</Text>
      <Text>Tap the header action to add a new item.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12, padding: 24 },
  title: { fontSize: 20, fontWeight: '600' },
})
