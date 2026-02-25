import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'

const MESSAGES = [
  'Ship the animation evals',
  'Validate gesture edge cases',
  'Confirm keyboard behavior on Android',
  'Document threshold semantics',
]

export default function App() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.messageList}>
        {MESSAGES.map((message) => (
          <View key={message} style={styles.messageBubble}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.composerBar}>
        <TextInput
          placeholder='Type a message'
          placeholderTextColor='#64748b'
          style={styles.input}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  composerBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    color: '#0f172a',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '70%',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageList: {
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  messageText: {
    color: '#0f172a',
    fontSize: 15,
  },
  screen: {
    backgroundColor: '#dbeafe',
    flex: 1,
  },
})
