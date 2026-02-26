import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  AppState,
  type AppStateStatus,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
  type Permission,
  type PermissionStatus,
} from 'react-native-permissions'

type NormalizedPermissionStatus =
  | typeof RESULTS.UNAVAILABLE
  | typeof RESULTS.DENIED
  | typeof RESULTS.BLOCKED
  | typeof RESULTS.GRANTED

const CAMERA_PERMISSION: Permission | undefined = Platform.select({
  ios: PERMISSIONS.IOS.CAMERA,
  android: PERMISSIONS.ANDROID.CAMERA,
})

function normalizeStatus(status: PermissionStatus): NormalizedPermissionStatus {
  switch (status) {
    case RESULTS.LIMITED:
      return RESULTS.GRANTED
    case RESULTS.UNAVAILABLE:
    case RESULTS.BLOCKED:
    case RESULTS.GRANTED:
    case RESULTS.DENIED:
      return status
  }
}

export default function App() {
  const [status, setStatus] = useState<NormalizedPermissionStatus>(
    RESULTS.DENIED
  )
  const [message, setMessage] = useState('Checking permission status...')
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const pendingSettingsReturnRef = useRef(false)
  const isRefreshingRef = useRef(false)
  const appStateRef = useRef(AppState.currentState)

  const handleError = useCallback((error: unknown, fallbackMessage: string) => {
    if (__DEV__) {
      console.error(error)
    }
    setMessage(fallbackMessage)
  }, [])

  const handleRefreshStatusError = useCallback(
    (error: unknown) => {
      handleError(error, 'Unable to check permission status.')
    },
    [handleError]
  )

  const applyStatus = useCallback(
    (rawStatus: PermissionStatus, source: 'check' | 'request') => {
      const nextStatus = normalizeStatus(rawStatus)
      setStatus(nextStatus)

      if (nextStatus === RESULTS.BLOCKED) {
        setMessage('Permission is blocked. Open settings to recover access.')
        return nextStatus
      }

      if (source === 'request') {
        setMessage(`Request result: ${nextStatus}`)
      } else {
        setMessage(`Current status: ${nextStatus}`)
      }

      return nextStatus
    },
    []
  )

  const refreshStatus = useCallback(async () => {
    if (isRefreshingRef.current) {
      return
    }

    if (!CAMERA_PERMISSION) {
      setStatus(RESULTS.UNAVAILABLE)
      setMessage('Camera permission is unavailable on this platform.')
      setIsBootstrapping(false)
      return
    }

    isRefreshingRef.current = true
    try {
      const rawStatus = await check(CAMERA_PERMISSION)
      applyStatus(rawStatus, 'check')
    } catch (error: unknown) {
      handleError(error, 'Unable to check permission status.')
    } finally {
      isRefreshingRef.current = false
      setIsBootstrapping(false)
    }
  }, [applyStatus, handleError])

  const openSettingsAsync = useCallback(async () => {
    pendingSettingsReturnRef.current = true
    setMessage(
      'Open system settings, change permission, then return to the app.'
    )

    try {
      await openSettings()
    } catch (error: unknown) {
      pendingSettingsReturnRef.current = false
      handleError(error, 'Unable to open system settings.')
    }
  }, [handleError])

  const requestPermission = useCallback(async () => {
    if (!CAMERA_PERMISSION) {
      setStatus(RESULTS.UNAVAILABLE)
      setMessage('Camera permission is unavailable on this platform.')
      return
    }

    try {
      const rawStatus = await request(CAMERA_PERMISSION)
      const nextStatus = applyStatus(rawStatus, 'request')

      if (nextStatus === RESULTS.BLOCKED) {
        await openSettingsAsync()
      }
    } catch (error: unknown) {
      handleError(error, 'Unable to request permission.')
    }
  }, [applyStatus, handleError, openSettingsAsync])

  const handleAppStateChange = useCallback(
    (nextState: AppStateStatus) => {
      const previousState = appStateRef.current
      appStateRef.current = nextState

      const becameActive = previousState !== 'active' && nextState === 'active'
      if (!becameActive || !pendingSettingsReturnRef.current) {
        return
      }

      pendingSettingsReturnRef.current = false
      refreshStatus().catch(handleRefreshStatusError)
    },
    [handleRefreshStatusError, refreshStatus]
  )

  useEffect(() => {
    refreshStatus().catch(handleRefreshStatusError)

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    )

    return () => subscription.remove()
  }, [handleAppStateChange, handleRefreshStatusError, refreshStatus])

  if (isBootstrapping) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#111827" />
        <Text style={styles.message}>
          Checking current permission status...
        </Text>
        <StatusBar style="auto" />
      </View>
    )
  }

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

      {status === RESULTS.BLOCKED && (
        <Pressable onPress={openSettingsAsync} style={styles.secondaryButton}>
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
