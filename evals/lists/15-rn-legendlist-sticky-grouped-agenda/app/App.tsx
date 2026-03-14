import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const EVENTS = [
  { id: 'event-1', day: 'Monday', title: 'Warehouse review', time: '09:00' },
  { id: 'event-2', day: 'Monday', title: 'Driver sync', time: '11:30' },
  { id: 'event-3', day: 'Tuesday', title: 'Returns audit', time: '10:00' },
  { id: 'event-4', day: 'Tuesday', title: 'Ops planning', time: '14:00' },
]

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Agenda</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#f8fafc',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
})
