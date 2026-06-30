import * as Calendar from 'expo-calendar'
import { useEffect, useRef, useState } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

type CalendarOption = {
  id: string
  title: string
}

export default function App() {
  const [calendars, setCalendars] = useState<CalendarOption[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [eventTitle, setEventTitle] = useState('')
  const [status, setStatus] = useState('')

  const calendarsRef = useRef<Calendar.Calendar[]>([])

  const loadCalendars = async () => {
    const permission = await Calendar.requestCalendarPermissions()
    if (!permission.granted) {
      setStatus('Calendar permission required.')
      return
    }

    const available = await Calendar.getCalendars(Calendar.EntityTypes.EVENT)
    const writable = available.filter((calendar) => calendar.allowsModifications)
    if (writable.length === 0) {
      setStatus('No writable calendar available.')
      return
    }

    calendarsRef.current = writable
    setCalendars(
      writable.map((calendar) => ({ id: calendar.id, title: calendar.title })),
    )
    setSelectedId(writable[0].id)
  }

  const createEvent = async () => {
    const calendar = calendarsRef.current.find((item) => item.id === selectedId)
    if (!calendar) {
      setStatus('Select a writable calendar first.')
      return
    }

    await calendar.createEvent({
      title: eventTitle,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 60 * 1000),
    })
    setStatus('Event created.')
  }

  useEffect(() => {
    void loadCalendars()
  }, [])

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>New event</Text>

      <View style={styles.calendarRow}>
        {calendars.map((calendar) => {
          const isActive = calendar.id === selectedId
          return (
            <Pressable
              key={calendar.id}
              onPress={() => setSelectedId(calendar.id)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {calendar.title}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <TextInput
        style={styles.input}
        value={eventTitle}
        onChangeText={setEventTitle}
        placeholder="Event title"
      />

      <Pressable style={styles.button} onPress={createEvent}>
        <Text style={styles.buttonText}>Create event</Text>
      </Pressable>

      {status ? <Text style={styles.status}>{status}</Text> : null}
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
  },
  calendarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderColor: '#94a3b8',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  chipText: {
    color: '#334155',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  input: {
    borderColor: '#d1d5db',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 12,
  },
  status: {
    color: '#6b7280',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
})
