import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect'
import { NavigationBar, addVisibilityListener } from 'expo-navigation-bar'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [visible, setVisible] = useState('unknown')
  const canUseGlass = isGlassEffectAPIAvailable()

  useEffect(() => {
    StatusBar.setStyle('light', true)
    if (Platform.OS !== 'android') return () => StatusBar.setStyle('auto', true)
    NavigationBar.setStyle('dark')
    const sub = addVisibilityListener((event) => setVisible(event.visibility))
    return () => {
      sub.remove()
      StatusBar.setStyle('auto', true)
      NavigationBar.setStyle('auto')
    }
  }, [])

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      {Platform.OS === 'android' ? <NavigationBar style="dark" /> : null}
      <Text style={styles.title}>System bars</Text>
      <Text style={styles.subtitle}>Navigation bar: {visible}</Text>
      {canUseGlass ? (
        <GlassView glassEffectStyle="regular" style={styles.card}>
          <Text style={styles.subtitle}>Liquid Glass controls available</Text>
        </GlassView>
      ) : (
        <View style={styles.card}>
          <Text style={styles.subtitle}>Liquid Glass fallback</Text>
        </View>
      )}
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
