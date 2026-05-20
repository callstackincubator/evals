import React from 'react'
import { StyleSheet, View } from 'react-native'

const ITEMS = [
  { id: 'item-1', title: 'Shift overview', subtitle: 'Morning operations' },
  { id: 'item-2', title: 'Driver queue', subtitle: 'Pending check-ins' },
  { id: 'item-3', title: 'Returns desk', subtitle: 'Open incidents' },
  { id: 'item-4', title: 'Stock audit', subtitle: 'Afternoon checklist' },
]

export default function App() {
  return (
    <View style={styles.screen} />
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#f8fafc',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
})
