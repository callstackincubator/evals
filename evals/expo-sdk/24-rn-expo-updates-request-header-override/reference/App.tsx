import * as Updates from 'expo-updates'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [cohort, setCohort] = useState<'default' | 'beta'>('default')
  const [message, setMessage] = useState('Default updates.')

  const select = async (next: 'default' | 'beta') => {
    setCohort(next)
    Updates.setUpdateRequestHeadersOverride(next === 'default' ? null : { 'expo-channel-name': 'beta' })
    const result = await Updates.checkForUpdateAsync()
    setMessage(result.isAvailable ? 'Update available for cohort.' : 'No update for cohort.')
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Update cohort</Text>
      <Text style={styles.subtitle}>{cohort}: {message}</Text>
      <Pressable onPress={() => select('beta')} style={styles.action}><Text style={styles.actionText}>Beta</Text></Pressable>
      <Pressable onPress={() => select('default')} style={styles.action}><Text style={styles.actionText}>Default</Text></Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  action: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    width: '100%',
  },
  media: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    height: 180,
    overflow: 'hidden',
    width: '100%',
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 12,
  },
  subtitle: {
    color: '#4b5563',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
})
