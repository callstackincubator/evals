import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useMemo, useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { check, openSettings, PERMISSIONS, request, RESULTS, type PermissionStatus } from 'react-native-permissions'

const CAMERA_PERMISSION =
  Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA

function normalizeStatus(status: PermissionStatus): 'unavailable' | 'denied' | 'blocked' | 'granted' {
  switch (status) {
    case RESULTS.UNAVAILABLE:
      return 'unavailable'
    case RESULTS.DENIED:
      return 'denied'
    case RESULTS.BLOCKED:
      return 'blocked'
    case RESULTS.GRANTED:
    case RESULTS.LIMITED:
      return 'granted'
    default:
      return 'denied'
  }
}

export default function App() {
  const [status, setStatus] = useState<'unavailable' | 'denied' | 'blocked' | 'granted'>('denied')
  const [note, setNote] = useState('Run check first to initialize state.')

  const runCheck = useCallback(async () => {
    const raw = await check(CAMERA_PERMISSION)
    const normalized = normalizeStatus(raw)
    setStatus(normalized)

    if (Platform.OS === 'android' && normalized === 'denied') {
      setNote('Android caveat: blocked can require request() path, not check() alone.')
      return
    }

    setNote(`Check result: ${normalized}`)
  }, [])

  const runRequest = useCallback(async () => {
    const raw = await request(CAMERA_PERMISSION)
    const normalized = normalizeStatus(raw)
    setStatus(normalized)

    if (normalized === 'blocked') {
      setNote('Permission blocked. Use Open settings to recover.')
      return
    }

    setNote(`Request result: ${normalized}`)
  }, [])

  const statusMessage = useMemo(() => {
    if (status === 'granted') {
      return 'Camera feature enabled'
    }

    if (status === 'blocked') {
      return 'Camera blocked in system settings'
    }

    if (status === 'unavailable') {
      return 'Camera unavailable on this device'
    }

    return 'Camera denied or not requested'
  }, [status])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>react-native-permissions Camera</Text>
      <Text style={styles.status}>Status: {status}</Text>
      <Text style={styles.statusMessage}>{statusMessage}</Text>

      <Pressable onPress={runCheck} style={styles.button}>
        <Text style={styles.buttonText}>Check permission</Text>
      </Pressable>

      <Pressable onPress={runRequest} style={styles.button}>
        <Text style={styles.buttonText}>Request permission</Text>
      </Pressable>

      <Pressable
        disabled={status !== 'blocked'}
        onPress={() => openSettings()}
        style={[styles.secondaryButton, status !== 'blocked' && styles.disabledButton]}
      >
        <Text style={styles.secondaryButtonText}>Open settings</Text>
      </Pressable>

      <Text style={styles.note}>{note}</Text>
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    rowGap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  status: {
    color: '#374151',
    fontWeight: '600',
  },
  statusMessage: {
    color: '#4b5563',
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 12,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#9ca3af',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    width: '100%',
  },
  secondaryButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  note: {
    color: '#111827',
    textAlign: 'center',
  },
})
