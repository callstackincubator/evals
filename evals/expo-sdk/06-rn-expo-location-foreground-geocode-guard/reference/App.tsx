import * as Location from 'expo-location'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type Coordinates = {
  latitude: number
  longitude: number
}

export default function App() {
  const [coords, setCoords] = useState<Coordinates | null>(null)
  const [address, setAddress] = useState<string | null>(null)

  const handleFindLocation = async () => {
    let permission = await Location.getForegroundPermissionsAsync()
    if (!permission.granted) {
      permission = await Location.requestForegroundPermissionsAsync()
    }
    if (!permission.granted) {
      setCoords(null)
      setAddress('Location permission denied')
      return
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    })
    setCoords(position.coords)

    const places = await Location.reverseGeocodeAsync(position.coords)
    if (!places.length) {
      setAddress('Address unavailable')
      return
    }
    const place = places[0]
    setAddress(
      [place.city, place.region, place.country].filter(Boolean).join(', ') ||
        'Address unavailable',
    )
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Where am I?</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Coordinates</Text>
        <Text style={styles.cardValue}>
          {coords
            ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
            : 'Unknown'}
        </Text>

        <Text style={styles.cardLabel}>Address</Text>
        <Text style={styles.cardValue}>{address ?? 'Unknown'}</Text>
      </View>

      <Pressable style={styles.button} onPress={handleFindLocation}>
        <Text style={styles.buttonText}>Find My Location</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    rowGap: 6,
  },
  cardLabel: {
    color: '#6b7280',
    fontSize: 13,
  },
  cardValue: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    rowGap: 16,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
  },
})
