import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

// @ts-expect-error we have not configured platform extensions 
import PlatformMessage from './PlatformMessage'

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Platform</Text>
      <PlatformMessage />
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
