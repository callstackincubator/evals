import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

export default function App() {
  const [title, setTitle] = useState('')
  const [startsAt, setStartsAt] = useState(new Date())

  const handlePickDate = () => {}
  const handlePickTime = () => {}

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
        <View style={styles.inlineRow}>
          <Pressable onPress={handlePickDate} style={[styles.input, styles.grow]}>
            <Text style={styles.inputText}>{startsAt.toDateString()}</Text>
          </Pressable>
          <Pressable onPress={handlePickTime} style={[styles.input, styles.grow]}>
            <Text style={styles.inputText}>
              {startsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
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
