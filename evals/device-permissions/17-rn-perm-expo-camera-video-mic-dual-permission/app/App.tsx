import { Pressable, StyleSheet, Text, View } from 'react-native'

async function requestVideoMicPermissionsPlaceholder() {
  // TODO: implement permission behavior for this eval
  return 'pending'
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Permissions Starter</Text>
      <Text style={styles.subtitle}>Implement platform permission flow from this shell.</Text>
      <Pressable style={styles.button} onPress={() => requestVideoMicPermissionsPlaceholder()}>
        <Text style={styles.buttonText}>Call placeholder</Text>
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
