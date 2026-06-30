import { StyleSheet, Text, View } from 'react-native'

import { getPlatform } from './src'

let platform = 'unknown'

try {
  platform = getPlatform()
} catch {
  // No implementation is registered for the current platform.
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Audit</Text>
      <Text style={styles.subtitle}>Running on: {platform}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    rowGap: 10,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
  },
})
