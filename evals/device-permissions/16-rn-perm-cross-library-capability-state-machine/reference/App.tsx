import { Camera } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AppState, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { check, openSettings, PERMISSIONS, RESULTS, type PermissionStatus } from 'react-native-permissions'

type CapabilityState = 'unavailable' | 'denied' | 'blocked' | 'granted' | 'limited' | 'provisional'
type CapabilityKey = 'camera' | 'media' | 'location' | 'notifications' | 'microphone'

type CapabilityModel = {
  state: CapabilityState
  details: string
}

type CapabilityMap = Record<CapabilityKey, CapabilityModel>

const INITIAL_CAPABILITIES: CapabilityMap = {
  camera: { details: 'Not checked', state: 'denied' },
  media: { details: 'Not checked', state: 'denied' },
  location: { details: 'Not checked', state: 'denied' },
  notifications: { details: 'Not checked', state: 'denied' },
  microphone: { details: 'Not checked', state: 'denied' },
}

function mapExpoPermission(
  status: Notifications.PermissionStatus,
  canAskAgain: boolean,
  options?: { limited?: boolean; provisional?: boolean }
): CapabilityState {
  if (status === Notifications.PermissionStatus.GRANTED) {
    if (options?.provisional) {
      return 'provisional'
    }

    if (options?.limited) {
      return 'limited'
    }

    return 'granted'
  }

  if (status === Notifications.PermissionStatus.DENIED) {
    return canAskAgain ? 'denied' : 'blocked'
  }

  return 'denied'
}

function mapRnPermission(status: PermissionStatus): CapabilityState {
  if (status === RESULTS.UNAVAILABLE) {
    return 'unavailable'
  }

  if (status === RESULTS.BLOCKED) {
    return 'blocked'
  }

  if (status === RESULTS.LIMITED) {
    return 'limited'
  }

  if (status === RESULTS.GRANTED) {
    return 'granted'
  }

  return 'denied'
}

async function loadCameraCapability(): Promise<CapabilityModel> {
  const [permission, available] = await Promise.all([
    Camera.getCameraPermissionsAsync(),
    Camera.isAvailableAsync(),
  ])

  if (!available) {
    return { details: 'Camera hardware unavailable', state: 'unavailable' }
  }

  return {
    details: permission.granted ? 'Camera ready' : 'Camera permission needed',
    state: mapExpoPermission(permission.status, permission.canAskAgain),
  }
}

async function loadMediaCapability(): Promise<CapabilityModel> {
  const permission = await ImagePicker.getMediaLibraryPermissionsAsync()

  return {
    details:
      permission.accessPrivileges === 'limited'
        ? 'Limited media access'
        : permission.granted
          ? 'Media library available'
          : 'Media permission needed',
    state: mapExpoPermission(permission.status, permission.canAskAgain, {
      limited: permission.accessPrivileges === 'limited',
    }),
  }
}

async function loadLocationCapability(): Promise<CapabilityModel> {
  const [permission, servicesEnabled] = await Promise.all([
    Location.getForegroundPermissionsAsync(),
    Location.hasServicesEnabledAsync(),
  ])

  if (!servicesEnabled) {
    return { details: 'Location services disabled', state: 'unavailable' }
  }

  return {
    details: permission.granted ? 'Location ready' : 'Location permission needed',
    state: mapExpoPermission(permission.status, permission.canAskAgain),
  }
}

async function loadNotificationCapability(): Promise<CapabilityModel> {
  const permission = await Notifications.getPermissionsAsync()

  return {
    details:
      permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
        ? 'Provisional notification auth'
        : permission.granted
          ? 'Notifications enabled'
          : 'Notifications permission needed',
    state: mapExpoPermission(permission.status, permission.canAskAgain, {
      provisional: permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL,
    }),
  }
}

async function loadMicrophoneCapability(): Promise<CapabilityModel> {
  const permission =
    Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO
  const status = await check(permission)

  return {
    details: status === RESULTS.GRANTED ? 'Microphone ready' : 'Microphone permission needed',
    state: mapRnPermission(status),
  }
}

export default function App() {
  const [capabilities, setCapabilities] = useState<CapabilityMap>(INITIAL_CAPABILITIES)

  const refreshAll = useCallback(async () => {
    const [camera, media, location, notifications, microphone] = await Promise.all([
      loadCameraCapability(),
      loadMediaCapability(),
      loadLocationCapability(),
      loadNotificationCapability(),
      loadMicrophoneCapability(),
    ])

    setCapabilities({
      camera,
      location,
      media,
      microphone,
      notifications,
    })
  }, [])

  useEffect(() => {
    refreshAll()

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        refreshAll()
      }
    })

    return () => subscription.remove()
  }, [refreshAll])

  const degradedCount = useMemo(() => {
    return Object.values(capabilities).filter((item) => item.state !== 'granted').length
  }, [capabilities])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Device Access Center</Text>
      <Text style={styles.subtitle}>Capabilities not fully granted: {degradedCount}</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {(Object.keys(capabilities) as CapabilityKey[]).map((key) => {
          const model = capabilities[key]

          return (
            <View key={key} style={styles.card}>
              <Text style={styles.cardTitle}>{key}</Text>
              <Text style={styles.cardState}>State: {model.state}</Text>
              <Text style={styles.cardDetails}>{model.details}</Text>

              <View style={styles.rowActions}>
                <Pressable onPress={refreshAll} style={styles.smallButton}>
                  <Text style={styles.smallButtonText}>Retry check</Text>
                </Pressable>

                {(model.state === 'denied' || model.state === 'blocked') && (
                  <Pressable onPress={() => openSettings()} style={styles.smallSecondaryButton}>
                    <Text style={styles.smallSecondaryButtonText}>Open settings</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )
        })}
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 64,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 16,
  },
  subtitle: {
    color: '#4b5563',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  scrollContent: {
    padding: 16,
    rowGap: 12,
  },
  card: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    rowGap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardState: {
    color: '#111827',
    fontWeight: '500',
  },
  cardDetails: {
    color: '#4b5563',
  },
  rowActions: {
    columnGap: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
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
  smallSecondaryButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#9ca3af',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallSecondaryButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
})
