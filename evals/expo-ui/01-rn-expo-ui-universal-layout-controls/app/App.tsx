import { useState } from 'react'
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'

export default function App() {
  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(false)

  const handleReset = () => {
    setPushEnabled(true)
    setEmailEnabled(false)
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Notifications</Text>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Push notifications</Text>
        <Switch value={pushEnabled} onValueChange={setPushEnabled} />
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Email updates</Text>
        <Switch value={emailEnabled} onValueChange={setEmailEnabled} />
      </View>

      <Pressable style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Reset to defaults</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  row: {
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowLabel: {
    color: '#111827',
    fontSize: 16,
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 12,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
})
