import { StyleSheet, Text, View } from 'react-native'

export default function SignIn() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <Text>Authenticate to access your account.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12, padding: 24 },
  title: { fontSize: 20, fontWeight: '600' },
})
