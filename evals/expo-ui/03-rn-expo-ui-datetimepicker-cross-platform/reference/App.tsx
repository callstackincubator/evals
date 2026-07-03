import DateTimePicker from '@expo/ui/community/datetime-picker'
import { useState } from 'react'
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

export default function App() {
  const [title, setTitle] = useState('')
  const [startsAt, setStartsAt] = useState(new Date())
  const [activePicker, setActivePicker] = useState<'date' | 'time' | null>(null)

  const closePicker = () => setActivePicker(null)

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
            onValueChange={(_event, next) => setStartsAt(next)}
          />
        ) : (
          <>
            <View style={styles.inlineRow}>
              <Pressable
                onPress={() => setActivePicker('date')}
                style={[styles.input, styles.grow]}
              >
                <Text style={styles.inputText}>{startsAt.toDateString()}</Text>
              </Pressable>
              <Pressable
                onPress={() => setActivePicker('time')}
                style={[styles.input, styles.grow]}
              >
                <Text style={styles.inputText}>
                  {startsAt.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </Pressable>
            </View>
            {activePicker != null && (
              <DateTimePicker
                mode={activePicker}
                value={startsAt}
                onValueChange={(_event, next) => {
                  setStartsAt(next)
                  closePicker()
                }}
                onDismiss={closePicker}
              />
            )}
            <Text style={styles.fallback}>
              Combined date and time selection is not available on this
              platform; pick each separately.
            </Text>
          </>
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
  grow: {
    flex: 1,
  },
  inlineRow: {
    columnGap: 10,
    flexDirection: 'row',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputText: {
    color: '#111827',
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
