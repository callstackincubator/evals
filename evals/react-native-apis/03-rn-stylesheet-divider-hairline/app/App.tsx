import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.panel}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Notifications</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Theme</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Privacy</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowLabel: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
  screen: {
    backgroundColor: '#f8fafc',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
})
