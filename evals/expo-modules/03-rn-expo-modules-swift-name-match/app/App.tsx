import { StyleSheet, Text, View } from 'react-native'

import { WeatherInlineModule } from './index'

let unit = 'unavailable'

try {
  unit = WeatherInlineModule.unit()
} catch {
  // The native module did not load under the requested name.
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Weather</Text>
      <Text style={styles.subtitle}>Temperature unit: {unit}</Text>
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
