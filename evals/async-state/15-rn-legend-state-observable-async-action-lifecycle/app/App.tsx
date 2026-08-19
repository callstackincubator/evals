import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type FeedStatus = 'idle' | 'loading' | 'success' | 'error'

export default function App() {
  const status = 'idle'
  const items = [] as string[]

  const statusContent = {
    idle: <Text style={styles.meta}>Tap fetch to start.</Text>,
    loading: <Text style={styles.meta}>Loading feed…</Text>,
    success: items.map((item) => (
      <View key={item} style={styles.item}>
        <Text>{item}</Text>
      </View>
    )),
    error: (
      <View style={styles.errorCard}>
        <Text style={styles.errorText}>Error</Text>
        <Pressable onPress={() => {}} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    ),
  } satisfies Record<FeedStatus, React.ReactNode>

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Feed</Text>

      <View style={styles.row}>
        <Pressable onPress={() => {}} style={styles.button}>
          <Text style={styles.buttonText}>Fetch feed</Text>
        </Pressable>

        <Pressable onPress={() => {}} style={styles.buttonSecondary}>
          <Text style={styles.buttonSecondaryText}>Reset</Text>
        </Pressable>
      </View>

      <Text style={styles.meta}>Status {status}</Text>

      {statusContent[status]}
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonSecondary: {
    backgroundColor: '#e2e8f0',
    borderColor: '#94a3b8',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonSecondaryText: {
    color: '#334155',
    fontWeight: '600',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    marginTop: 10,
    padding: 12,
  },
  errorText: {
    color: '#b91c1c',
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  meta: {
    color: '#334155',
    marginTop: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#b91c1c',
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  screen: {
    backgroundColor: '#f1f5f9',
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 56,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
  },
})
