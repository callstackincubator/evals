import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { audit, type AuditResult } from './src'

export default function App() {
  const [result, setResult] = useState<AuditResult | null>(null)

  useEffect(() => {
    audit().then(setResult)
  }, [])

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Audit</Text>
      <Text style={styles.subtitle}>
        Status: {result ? (result.ok ? 'ok' : 'failed') : 'running…'}
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
