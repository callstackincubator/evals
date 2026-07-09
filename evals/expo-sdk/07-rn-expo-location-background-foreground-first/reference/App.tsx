import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import { useState } from 'react'
import { StyleSheet, Switch, Text, View } from 'react-native'

const TASK_NAME = 'trip-tracking-location'

TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
  if (error) return
  console.log('background-location', data)
})

export default function App() {
  const [tracking, setTracking] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const handleToggleTracking = async (value: boolean) => {
    if (!value) {
      if (await Location.hasStartedLocationUpdatesAsync(TASK_NAME)) {
        await Location.stopLocationUpdatesAsync(TASK_NAME)
      }
      setTracking(false)
      setLastUpdate('Tracking stopped')
      return
    }

    const foreground = await Location.requestForegroundPermissionsAsync()
    if (!foreground.granted) {
      setLastUpdate('Foreground permission required')
      return
    }
    const background = await Location.requestBackgroundPermissionsAsync()
    if (!background.granted) {
      setLastUpdate('Background permission denied')
      return
    }

    const alreadyStarted =
      await Location.hasStartedLocationUpdatesAsync(TASK_NAME)
    if (!alreadyStarted) {
      await Location.startLocationUpdatesAsync(TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 100,
        pausesUpdatesAutomatically: true,
      })
    }
    setTracking(true)
    setLastUpdate('Tracking started')
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Trip Tracking</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Last update</Text>
        <Text style={styles.cardValue}>{lastUpdate ?? 'No updates yet'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Track in background</Text>
        <Switch value={tracking} onValueChange={handleToggleTracking} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
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
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: '#111827',
    fontSize: 16,
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
