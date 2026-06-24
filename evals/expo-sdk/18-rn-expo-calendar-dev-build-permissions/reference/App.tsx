import * as Calendar from 'expo-calendar'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [message, setMessage] = useState('No event created.')

  const create = async () => {
    const permission = await Calendar.requestCalendarPermissions()
    if (!permission.granted) {
      setMessage('Calendar permission denied.')
      return
    }
    const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT)
    const calendar = calendars.find((item) => item.allowsModifications)
    if (!calendar) {
      setMessage('No writable calendar available.')
      return
    }
    const event = await calendar.createEvent({
      endDate: new Date(Date.now() + 60 * 60 * 1000),
      startDate: new Date(),
      title: 'Expo planning',
    })
    setMessage(event.id)
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Calendar</Text>
      <Text style={styles.subtitle}>{message}</Text>
      <Pressable onPress={create} style={styles.action}><Text style={styles.actionText}>Create event</Text></Pressable>
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
