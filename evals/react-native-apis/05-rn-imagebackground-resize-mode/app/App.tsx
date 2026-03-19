import React from 'react'
import {
  StyleSheet,
  Text,
  View,
} from 'react-native'

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Overview</Text>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Dock overview</Text>
          <Text style={styles.headerSubtitle}>Morning coordination</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    borderRadius: 20,
    height: 200,
    overflow: 'hidden',
    width: 300,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  headerSubtitle: {
    color: '#475569',
    marginTop: 4,
  },
  headerTitle: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
  },
  screen: {
    alignItems: 'center',
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
