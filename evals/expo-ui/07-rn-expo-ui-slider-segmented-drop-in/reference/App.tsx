import { Slider } from '@expo/ui/community/slider'
import { SegmentedControl } from '@expo/ui/community/segmented-control'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [value, setValue] = useState(40)
  const [segment, setSegment] = useState('daily')
  const segments = ['daily', 'weekly']
  return (
    <View style={styles.screen}>
      <Slider minimumValue={0} maximumValue={100} value={value} onValueChange={setValue} />
      <SegmentedControl selectedIndex={segments.indexOf(segment)} onValueChange={setSegment} values={segments} />
      <Text style={styles.subtitle}>{segment}: {Math.round(value)}</Text>
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
