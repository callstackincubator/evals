import React from 'react'
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native'

const cardChrome = Platform.select({
  android: {
    elevation: 6,
  },
  default: {
    borderColor: '#cbd5e1',
    borderWidth: 1,
  },
  ios: {
    shadowColor: '#0f172a',
    shadowOffset: {
      height: 6,
      width: 0,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
})

export default function App() {
  return (
    <View style={styles.screen}>
      <View style={[styles.card, cardChrome]}>
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
