import * as Location from 'expo-location'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [summary, setSummary] = useState('Location not loaded.')

  const locate = async () => {
    const permission = await Location.requestForegroundPermissionsAsync()
    if (!permission.granted) {
      setSummary('Foreground location permission denied.')
      return
    }
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
    const [place] = await Location.reverseGeocodeAsync(position.coords)
    setSummary(place ? [place.city, place.region, place.country].filter(Boolean).join(', ') : 'Coordinates found, address unavailable.')
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Location lookup</Text>
      <Text style={styles.subtitle}>{summary}</Text>
      <Pressable onPress={locate} style={styles.action}><Text style={styles.actionText}>Use current location</Text></Pressable>
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
