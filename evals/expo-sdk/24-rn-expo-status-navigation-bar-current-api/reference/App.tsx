import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect'
import { NavigationBar, addVisibilityListener } from 'expo-navigation-bar'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'

type BarStyle = 'light' | 'dark'

export default function App() {
  const [barStyle, setBarStyle] = useState<BarStyle>('dark')
  const [glass, setGlass] = useState(false)
  const [navVisibility, setNavVisibility] = useState<'visible' | 'hidden'>(
    'visible',
  )
  const canUseGlass = isGlassEffectAPIAvailable()

  useEffect(() => {
    StatusBar.setStyle(barStyle, true)
    if (Platform.OS !== 'android') {
      return () => {
        StatusBar.setStyle('auto', true)
      }
    }
    NavigationBar.setStyle(barStyle)
    const subscription = addVisibilityListener((event) => {
      setNavVisibility(event.visibility)
    })
    return () => {
      subscription.remove()
      StatusBar.setStyle('auto', true)
      NavigationBar.setStyle('auto')
    }
  }, [barStyle])

  return (
    <View style={styles.screen}>
      <StatusBar style={barStyle} />
      {Platform.OS === 'android' ? <NavigationBar style={barStyle} /> : null}
      <Text style={styles.title}>Appearance</Text>

      {Platform.OS === 'android' ? (
        <Text style={styles.subtitle}>Navigation bar: {navVisibility}</Text>
      ) : null}

      <View style={styles.controls}>
        <Pressable
          style={styles.toggle}
          onPress={() =>
            setBarStyle((current) => (current === 'dark' ? 'light' : 'dark'))
          }
        >
          <Text style={styles.toggleText}>Bar style: {barStyle}</Text>
        </Pressable>

        <Pressable
          style={[styles.toggle, glass && styles.toggleActive]}
          onPress={() => setGlass((current) => !current)}
        >
          <Text style={[styles.toggleText, glass && styles.toggleTextActive]}>
            {glass ? 'Glass on' : 'Glass off'}
          </Text>
        </Pressable>
      </View>

      {glass && canUseGlass ? (
        <GlassView glassEffectStyle="regular" style={styles.glassCard}>
          <Text style={styles.subtitle}>Liquid Glass surface</Text>
        </GlassView>
      ) : (
        <View style={styles.glassCard}>
          <Text style={styles.subtitle}>
            {glass
              ? 'Liquid Glass not supported on this platform.'
              : 'Controls the system status and navigation bars.'}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  glassCard: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    width: '100%',
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 12,
  },
  subtitle: {
    color: '#6b7280',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
  toggle: {
    borderColor: '#94a3b8',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  toggleActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  toggleText: {
    color: '#334155',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
  },
})
