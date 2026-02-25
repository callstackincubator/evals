import { Pressable, StyleSheet, Text, View } from 'react-native'

async function recheckAfterSettingsAction() {
  // No-op
  return 'pending'
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Permissions</Text>
      <Text style={styles.subtitle}>Permission status and actions.</Text>
      <Pressable style={styles.button} onPress={() => recheckAfterSettingsAction()}>
        <Text style={styles.buttonText}>Open</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    rowGap: 10,
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
  },
})
