import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import {
  check,
  checkNotifications,
  openSettings,
  PERMISSIONS,
  request,
  requestNotifications,
  RESULTS,
  type Permission,
  type PermissionStatus,
} from 'react-native-permissions'

type Capability = 'camera' | 'microphone' | 'notifications'
type UiStatus = 'unavailable' | 'denied' | 'blocked' | 'granted'
type CapabilityStatusMap = Record<Capability, UiStatus>

const INITIAL_STATUSES: CapabilityStatusMap = {
  camera: 'denied',
  microphone: 'denied',
  notifications: 'denied',
}

const APP_PERMISSIONS: Record<Exclude<Capability, 'notifications'>, Permission> = {
  camera: Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
  microphone: Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO,
}

const SEQUENCE: Capability[] = ['camera', 'microphone', 'notifications']

function toUiStatus(status: PermissionStatus): UiStatus {
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
  const [statuses, setStatuses] = useState<CapabilityStatusMap>(INITIAL_STATUSES)
  const [message, setMessage] = useState('')

  const refreshCapability = async (capability: Capability) => {
    if (capability === 'notifications') {
      const result = await checkNotifications()
      const uiStatus = toUiStatus(result.status)
      setStatuses((prev) => ({ ...prev, notifications: uiStatus }))
      return uiStatus
    }

    const raw = await check(APP_PERMISSIONS[capability])
    const uiStatus = toUiStatus(raw)
    setStatuses((prev) => ({ ...prev, [capability]: uiStatus }))
    return uiStatus
  }

  const requestCapability = async (capability: Capability) => {
    if (capability === 'notifications') {
      const result = await requestNotifications(['alert', 'badge', 'sound'])
      setStatuses((prev) => ({ ...prev, notifications: toUiStatus(result.status) }))
      return
    }

    const raw = await request(APP_PERMISSIONS[capability])
    setStatuses((prev) => ({ ...prev, [capability]: toUiStatus(raw) }))
  }

  const runSequencedSetup = async () => {
    setMessage('')

    for (const capability of SEQUENCE) {
      const current = await refreshCapability(capability)

      if (current !== 'denied') continue

      await requestCapability(capability)
    }

    setMessage('Finished sequenced requests. Android blocked outcomes are detected via request path.')
  }

  const allGranted = SEQUENCE.every((capability) => statuses[capability] === 'granted')

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Permissions</Text>

      <Pressable onPress={runSequencedSetup} style={styles.button}>
        <Text style={styles.buttonText}>Run camera → microphone → notifications</Text>
      </Pressable>

      {SEQUENCE.map((capability) => (
        <View key={capability} style={styles.row}>
          <Text style={styles.rowTitle}>{capability}</Text>
          <Text style={styles.rowState}>{statuses[capability]}</Text>

          <View style={styles.rowActions}>
            <Pressable
              onPress={() => refreshCapability(capability)}
              style={[styles.smallButton, styles.secondarySmallButton]}
            >
              <Text style={styles.secondarySmallButtonText}>Check</Text>
            </Pressable>

            <Pressable onPress={() => requestCapability(capability)} style={styles.smallButton}>
              <Text style={styles.smallButtonText}>Retry</Text>
            </Pressable>

            {(statuses[capability] === 'blocked' || statuses[capability] === 'denied') && (
              <Pressable
                onPress={() => openSettings()}
                style={[styles.smallButton, styles.secondarySmallButton]}
              >
                <Text style={styles.secondarySmallButtonText}>Settings</Text>
              </Pressable>
            )}
          </View>
        </View>
      ))}

      <Text style={styles.summary}>{allGranted ? 'All permissions granted' : 'Partial or degraded access'}</Text>
      <Text style={styles.message}>{message}</Text>
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    rowGap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  row: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    rowGap: 8,
  },
  rowTitle: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  rowState: {
    color: '#374151',
  },
  rowActions: {
    columnGap: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  smallButton: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondarySmallButton: {
    backgroundColor: '#fff',
    borderColor: '#9ca3af',
    borderWidth: 1,
  },
  secondarySmallButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
  summary: {
    color: '#1f2937',
    textAlign: 'center',
  },
  message: {
    color: '#4b5563',
    textAlign: 'center',
  },
})
