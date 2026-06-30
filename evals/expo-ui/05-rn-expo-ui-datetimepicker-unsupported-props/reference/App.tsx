import DateTimePicker from '@expo/ui/community/datetime-picker'
import { useState } from 'react'
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native'

export default function App() {
  const [title, setTitle] = useState('')
  const [startsAt, setStartsAt] = useState(new Date())

  const updateStartsAt = (next?: Date) => {
    if (next) {
      setStartsAt(next)
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>New appointment</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="What's this about?"
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Starts</Text>
        {Platform.OS === 'ios' ? (
          <DateTimePicker
            mode="datetime"
            value={startsAt}
            onValueChange={(_event, next) => updateStartsAt(next)}
          />
        ) : (
          <View style={styles.inlineRow}>
            <DateTimePicker
              mode="date"
              value={startsAt}
              onValueChange={(_event, next) => updateStartsAt(next)}
            />
            <DateTimePicker
              mode="time"
              value={startsAt}
              onValueChange={(_event, next) => updateStartsAt(next)}
            />
            <Text style={styles.fallback}>
              Combined date and time selection is not available on this platform; pick each separately.
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  fallback: {
    color: '#6b7280',
    fontSize: 13,
  },
  field: {
    rowGap: 6,
  },
  inlineRow: {
    rowGap: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  label: {
    color: '#6b7280',
    fontSize: 13,
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 16,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
  },
})
