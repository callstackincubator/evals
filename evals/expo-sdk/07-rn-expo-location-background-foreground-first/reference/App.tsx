import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

const TASK_NAME = 'background-location-audit'

TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
  if (error) return
  console.log('background-location', data)
})

export default function App() {
  const [status, setStatus] = useState('Background tracking is off.')

  const start = async () => {
    const foreground = await Location.requestForegroundPermissionsAsync()
    if (!foreground.granted) {
      setStatus('Foreground permission is required first.')
      return
    }
    const background = await Location.requestBackgroundPermissionsAsync()
    if (!background.granted) {
      setStatus('Background permission denied.')
      return
    }
    const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(TASK_NAME)
    if (!alreadyStarted) {
      await Location.startLocationUpdatesAsync(TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 100,
        pausesUpdatesAutomatically: true,
      })
    }
    setStatus('Background tracking is active.')
  }

  const stop = async () => {
    if (await Location.hasStartedLocationUpdatesAsync(TASK_NAME)) {
      await Location.stopLocationUpdatesAsync(TASK_NAME)
    }
    setStatus('Background tracking is off.')
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Background location</Text>
      <Text style={styles.subtitle}>{status}</Text>
      <Pressable onPress={start} style={styles.action}><Text style={styles.actionText}>Enable</Text></Pressable>
      <Pressable onPress={stop} style={styles.action}><Text style={styles.actionText}>Disable</Text></Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  action: { backgroundColor: '#111827', borderRadius: 10, padding: 12 },
  actionText: { color: '#fff', fontWeight: '600' },
  screen: { backgroundColor: '#fff', flex: 1, padding: 20, rowGap: 12 },
  subtitle: { color: '#4b5563' },
  title: { color: '#111827', fontSize: 20, fontWeight: '700' },
})
