import React from 'react'
import { StyleSheet, View } from 'react-native'

const PHOTOS = [
  { id: 'photo-1', label: 'Lakeside', height: 160 },
  { id: 'photo-2', label: 'Transit', height: 220 },
  { id: 'photo-3', label: 'Bridge', height: 140 },
  { id: 'photo-4', label: 'Studio', height: 260 },
  { id: 'photo-5', label: 'Valley', height: 180 },
  { id: 'photo-6', label: 'Warehouse', height: 210 },
]

export default function App() {
  return (
    <View style={styles.screen} />
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#eff6ff',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
})
