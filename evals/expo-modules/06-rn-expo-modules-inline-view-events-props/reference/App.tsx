import { StyleSheet, Text, View } from 'react-native'

import AuditLabel from './src/AuditLabel'

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Audit Label</Text>
      <AuditLabel
        title="Tap to audit"
        onReady={() => {
          console.log('AuditLabel is ready')
        }}
        style={styles.label}
      />
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
  label: {
    height: 44,
    width: 200,
  },
})
