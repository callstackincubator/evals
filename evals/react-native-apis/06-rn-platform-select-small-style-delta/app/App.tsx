import React from 'react'
import {
  StyleSheet,
  Text,
  View,
} from 'react-native'

export default function App() {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Summary</Text>
        <Text style={styles.description}>
          Crew updates for the current shift.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  description: {
    color: '#475569',
    marginTop: 8,
  },
  screen: {
    backgroundColor: '#f8fafc',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
  },
})
