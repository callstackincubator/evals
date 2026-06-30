import { requireNativeModule } from 'expo'
import { StyleSheet, Text, View } from 'react-native'

type DeviceAuditModule = {
  source: string
  getOsVersion(): string
}

let osVersion = 'unknown'
let source = 'unavailable'

try {
  const DeviceAudit = requireNativeModule<DeviceAuditModule>('DeviceAuditModule')
  osVersion = DeviceAudit.getOsVersion()
  source = DeviceAudit.source
} catch {
  // Native module is not registered with the current build yet.
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Device Audit</Text>
      <Text style={styles.row}>OS version: {osVersion}</Text>
      <Text style={styles.row}>Module source: {source}</Text>
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
  row: {
    color: '#374151',
  },
})
