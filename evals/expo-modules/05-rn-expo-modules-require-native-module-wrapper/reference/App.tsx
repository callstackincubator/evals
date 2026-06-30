import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { DeviceAudit } from './src'

export default function App() {
  const [battery, setBattery] = useState('loading…')

  useEffect(() => {
    // No types here, so this call site is unchecked.
    DeviceAudit.getBatteryLabelAsync()
      .then((label: string) => setBattery(label))
      .catch(() => setBattery('unavailable'))
  }, [])

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Device Audit</Text>
      <Text style={styles.subtitle}>Battery: {battery}</Text>
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
