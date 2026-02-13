import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
  type Permission,
  type PermissionStatus,
} from 'react-native-permissions'

type UiStatus = 'unavailable' | 'denied' | 'blocked' | 'granted'

const CAMERA_PERMISSION: Permission =
  Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA

function mapStatus(status: PermissionStatus): UiStatus {
  if (status === RESULTS.UNAVAILABLE) {
    return 'unavailable'
  }

  if (status === RESULTS.BLOCKED) {
    return 'blocked'
  }

  if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
    return 'granted'
  }

  return 'denied'
}

export default function App() {
  const [status, setStatus] = useState<UiStatus>('denied')
  const [message, setMessage] = useState('')
  const pendingSettingsReturn = useRef(false)
  const isRefreshing = useRef(false)

  const refreshStatus = useCallback(async () => {
    if (isRefreshing.current) {
      return
    }

    isRefreshing.current = true
    const raw = await check(CAMERA_PERMISSION)
    setStatus(mapStatus(raw))
    isRefreshing.current = false
  }, [])

  const requestPermission = useCallback(async () => {
    const raw = await request(CAMERA_PERMISSION)
    const next = mapStatus(raw)
    setStatus(next)

    if (next === 'blocked') {
      setMessage('Permission blocked. Open settings to recover.')
      return
    }

    setMessage(`Request result: ${next}`)
  }, [])

  useEffect(() => {
    refreshStatus()

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && pendingSettingsReturn.current) {
        pendingSettingsReturn.current = false
        refreshStatus()
      }
    })

    return () => subscription.remove()
  }, [refreshStatus])

  const openSettingsAndWait = useCallback(() => {
    pendingSettingsReturn.current = true
    openSettings()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blocked Permission Recovery</Text>
      <Text style={styles.state}>Status: {status}</Text>

      <Pressable onPress={refreshStatus} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Check status</Text>
      </Pressable>

      <Pressable onPress={requestPermission} style={styles.button}>
        <Text style={styles.buttonText}>Request permission</Text>
      </Pressable>

      {status === 'blocked' && (
        <Pressable onPress={openSettingsAndWait} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Open settings</Text>
        </Pressable>
      )}

      <Text style={styles.message}>{message}</Text>
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
  },
  state: {
    color: '#374151',
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
  message: {
    color: '#111827',
    textAlign: 'center',
  },
})
