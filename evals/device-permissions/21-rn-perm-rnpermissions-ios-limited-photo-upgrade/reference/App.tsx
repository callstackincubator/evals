import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useRef, useState } from 'react'
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
import { launchImageLibrary } from 'react-native-image-picker'
import {
  check,
  openPhotoPicker,
  PERMISSIONS,
  request,
  RESULTS,
  type Permission,
  type PermissionStatus,
} from 'react-native-permissions'

type PhotoAccess =
  | typeof RESULTS.UNAVAILABLE
  | typeof RESULTS.DENIED
  | typeof RESULTS.BLOCKED
  | typeof RESULTS.LIMITED
  | typeof RESULTS.GRANTED

const PHOTO_PERMISSION: Permission | undefined = Platform.select({
  ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
})

function mapPhotoAccess(status: PermissionStatus): PhotoAccess {
  switch (status) {
    case RESULTS.UNAVAILABLE:
    case RESULTS.DENIED:
    case RESULTS.BLOCKED:
    case RESULTS.LIMITED:
    case RESULTS.GRANTED:
      return status
  }

  return RESULTS.DENIED
}

function getPhotoAccessMessage(
  photoAccess: PhotoAccess,
  source: 'check' | 'request'
): string {
  switch (photoAccess) {
    case RESULTS.LIMITED:
      return 'Limited photo access granted. You can still pick allowed photos.'
    case RESULTS.BLOCKED:
      return 'Photo access is blocked. Use system settings to recover.'
    case RESULTS.GRANTED:
      return source === 'request'
        ? 'Full photo access granted.'
        : 'Current access: granted.'
    case RESULTS.UNAVAILABLE:
      return 'Photo library permission is unavailable on this platform.'
    default:
      return source === 'request'
        ? 'Photo access denied.'
        : 'Current access: denied.'
  }
}

export default function App() {
  const [photoAccess, setPhotoAccess] = useState<PhotoAccess>(RESULTS.DENIED)
  const [message, setMessage] = useState('Checking photo access...')
  const [assetLabel, setAssetLabel] = useState('No selection yet')
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const pendingUpgradeReturnRef = useRef(false)
  const isRefreshingRef = useRef(false)
  const appStateRef = useRef(AppState.currentState)

  function handleError(error: unknown, fallbackMessage: string) {
    if (__DEV__) {
      console.error(error)
    }
    setMessage(fallbackMessage)
  }

  function applyPhotoAccess(
    status: PermissionStatus,
    source: 'check' | 'request'
  ): PhotoAccess {
    const nextAccess = mapPhotoAccess(status)
    setPhotoAccess(nextAccess)
    setMessage(getPhotoAccessMessage(nextAccess, source))
    return nextAccess
  }

  async function refreshAccess() {
    if (isRefreshingRef.current) {
      return
    }

    if (!PHOTO_PERMISSION) {
      setPhotoAccess(RESULTS.UNAVAILABLE)
      setMessage('This eval targets iOS limited photo access behavior.')
      setIsBootstrapping(false)
      return
    }

    isRefreshingRef.current = true
    try {
      const status = await check(PHOTO_PERMISSION)
      applyPhotoAccess(status, 'check')
    } catch (error: unknown) {
      handleError(error, 'Unable to check photo access.')
    } finally {
      isRefreshingRef.current = false
      setIsBootstrapping(false)
    }
  }

  async function requestAccess() {
    if (!PHOTO_PERMISSION) {
      setPhotoAccess(RESULTS.UNAVAILABLE)
      setMessage('This eval targets iOS limited photo access behavior.')
      return
    }

    try {
      const status = await request(PHOTO_PERMISSION)
      applyPhotoAccess(status, 'request')
    } catch (error: unknown) {
      handleError(error, 'Unable to request photo access.')
    }
  }

  async function openUpgradePicker() {
    if (photoAccess !== RESULTS.LIMITED) {
      setMessage('Upgrade picker is available from limited state only.')
      return
    }

    pendingUpgradeReturnRef.current = true
    setMessage(
      'Select additional photos, then return to the app to re-check access.'
    )

    try {
      await openPhotoPicker()
    } catch (error: unknown) {
      pendingUpgradeReturnRef.current = false
      handleError(error, 'openPhotoPicker is unavailable in this environment.')
    }
  }

  function handleRefreshAccessError(error: unknown) {
    handleError(error, 'Unable to check photo access.')
  }

  function handleAppStateChange(nextState: AppStateStatus) {
    const previousState = appStateRef.current
    appStateRef.current = nextState

    const becameActive = previousState !== 'active' && nextState === 'active'
    if (!becameActive || !pendingUpgradeReturnRef.current) {
      return
    }

    pendingUpgradeReturnRef.current = false
    refreshAccess().catch(handleRefreshAccessError)
  }

  useEffect(() => {
    refreshAccess().catch(handleRefreshAccessError)

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    )
    return () => subscription.remove()
  }, [])

  async function selectPhoto() {
    if (
      photoAccess === RESULTS.DENIED ||
      photoAccess === RESULTS.BLOCKED ||
      photoAccess === RESULTS.UNAVAILABLE
    ) {
      setMessage('Cannot open library without photo permission.')
      return
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      })

      if (result.didCancel) {
        setMessage('Selection canceled.')
        return
      }

      if (result.errorCode) {
        setMessage(`Picker error: ${result.errorMessage ?? result.errorCode}`)
        return
      }

      const first = result.assets?.[0]
      if (!first) {
        setMessage('No asset returned.')
        return
      }

      setAssetLabel(first.fileName ?? first.uri ?? 'unnamed')
      setMessage(
        photoAccess === RESULTS.LIMITED
          ? 'Picked photo in limited mode.'
          : 'Picked photo in full mode.'
      )
    } catch (error: unknown) {
      handleError(error, 'Unable to launch image picker.')
    }
  }

  if (isBootstrapping) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" />
        <Text style={styles.message}>Checking current photo access...</Text>
        <StatusBar style="auto" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Permissions</Text>
      <Text style={styles.state}>Access: {photoAccess}</Text>

      <Pressable onPress={refreshAccess} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Check access</Text>
      </Pressable>

      <Pressable onPress={requestAccess} style={styles.button}>
        <Text style={styles.buttonText}>Request access</Text>
      </Pressable>

      <Pressable onPress={openUpgradePicker} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>
          Upgrade with openPhotoPicker
        </Text>
      </Pressable>

      <Pressable onPress={selectPhoto} style={styles.button}>
        <Text style={styles.buttonText}>Select photo</Text>
      </Pressable>

      <Text style={styles.asset}>Selected: {assetLabel}</Text>
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
  asset: {
    color: '#1f2937',
  },
  message: {
    color: '#111827',
    textAlign: 'center',
  },
})
