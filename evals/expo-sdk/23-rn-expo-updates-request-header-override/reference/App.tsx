import * as Updates from 'expo-updates'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

const CHANNELS = ['production', 'staging', 'beta'] as const

type Channel = (typeof CHANNELS)[number]

export default function App() {
  const [channel, setChannel] = useState<Channel>('production')
  const [status, setStatus] = useState('')

  const selectChannel = async (next: Channel) => {
    setChannel(next)
    setStatus(`Checking ${next}…`)
    try {
      Updates.setUpdateRequestHeadersOverride(
        next === 'production' ? null : { 'expo-channel-name': next },
      )
      const result = await Updates.checkForUpdateAsync()
      setStatus(
        result.isAvailable
          ? `Update available on ${next}.`
          : `No update on ${next}.`,
      )
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Update check failed.')
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Release channel</Text>

      <View style={styles.channelRow}>
        {CHANNELS.map((option) => {
          const isActive = option === channel
          return (
            <Pressable
              key={option}
              onPress={() => selectChannel(option)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, isActive && styles.chipTextActive]}
              >
                {option}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <Text style={styles.subtitle}>Active channel: {channel}</Text>
      {status ? <Text style={styles.status}>{status}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  channelRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    borderColor: '#94a3b8',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  chipText: {
    color: '#334155',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: '#fff',
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 12,
  },
  status: {
    color: '#6b7280',
  },
  subtitle: {
    color: '#4b5563',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
})
