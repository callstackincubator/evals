import { useState } from 'react'
import { StyleSheet, Switch, Text, View } from 'react-native'

export default function App() {
  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(false)

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
    </View>
  )
}

const styles = StyleSheet.create({
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
