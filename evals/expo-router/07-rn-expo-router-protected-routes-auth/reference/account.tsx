import { StyleSheet, Text, View } from 'react-native'

export default function Account() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <Text>Signed-in profile details.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12, padding: 24 },
  title: { fontSize: 20, fontWeight: '600' },
})
