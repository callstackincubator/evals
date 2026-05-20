import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Platform</Text>
    </View>
  )
}

const styles = StyleSheet.create({
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
