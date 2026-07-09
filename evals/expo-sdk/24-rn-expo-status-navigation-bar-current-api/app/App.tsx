import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type BarStyle = 'light' | 'dark'

export default function App() {
  const [barStyle, setBarStyle] = useState<BarStyle>('dark')
  const [glass, setGlass] = useState(false)

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Appearance</Text>

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

      <Text style={styles.subtitle}>
        Controls the system status and navigation bars.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
