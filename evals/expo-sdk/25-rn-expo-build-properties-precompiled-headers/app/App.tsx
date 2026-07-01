import { StyleSheet, Text, View } from 'react-native'

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Build properties audit</Text>
      <Text style={styles.subtitle}>
        Native build configuration is managed in app.config.ts.
      </Text>
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
    rowGap: 8,
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
})
