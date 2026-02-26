import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'

const FIELDS = [
  'First name',
  'Last name',
  'Email',
  'Company',
  'Role',
  'City',
  'Notes',
]

export default function App() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Checkout form</Text>
        {FIELDS.map((field) => (
          <View key={field} style={styles.fieldBlock}>
            <Text style={styles.label}>{field}</Text>
            <TextInput
              placeholder={field}
              placeholderTextColor='#64748b'
              style={styles.input}
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.submitButton}>
          <Text style={styles.submitText}>Submit</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  fieldBlock: {
    marginBottom: 14,
  },
  footer: {
    backgroundColor: '#fff',
    borderTopColor: '#cbd5e1',
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#cbd5e1',
    borderRadius: 10,
    borderWidth: 1,
    color: '#0f172a',
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  label: {
    color: '#1e293b',
    fontSize: 13,
    marginBottom: 6,
  },
  screen: {
    backgroundColor: '#f8fafc',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 14,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
})
