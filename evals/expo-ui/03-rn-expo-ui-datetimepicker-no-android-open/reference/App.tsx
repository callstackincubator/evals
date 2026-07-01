import DateTimePicker from '@expo/ui/community/datetime-picker'
import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

export default function App() {
  const [name, setName] = useState('')
  const [date, setDate] = useState(new Date())

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>New reservation</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Guest name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Date</Text>
        <DateTimePicker
          mode="date"
          value={date}
          onValueChange={(_event, selectedDate) => {
            if (selectedDate) {
              setDate(selectedDate)
            }
          }}
        />
        <Text style={styles.inputText}>{date.toDateString()}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    rowGap: 6,
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
