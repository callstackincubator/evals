import * as Notifications from 'expo-notifications'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [events, setEvents] = useState<string[]>([])

  useEffect(() => {
    const received = Notifications.addNotificationReceivedListener((notification) => {
      setEvents((items) => [notification.request.identifier, ...items])
    })
    const responses = Notifications.addNotificationResponseReceivedListener((response) => {
      setEvents((items) => [`tap:${response.notification.request.identifier}`, ...items])
    })
    return () => {
      received.remove()
      responses.remove()
    }
  }, [])

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Notification inbox</Text>
      {events.map((event) => <Text key={event} style={styles.subtitle}>{event}</Text>)}
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
