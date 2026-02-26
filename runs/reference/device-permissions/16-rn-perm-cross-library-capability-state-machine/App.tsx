import { Camera } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useEffect, useState } from 'react'
import {
  AppState,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {
  check,
  openSettings,
  PERMISSIONS,
  RESULTS,
  type PermissionStatus,
} from 'react-native-permissions'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type CapabilityState =
  | 'unavailable'
  | 'denied'
  | 'blocked'
  | 'granted'
  | 'limited'
  | 'provisional'
type CapabilityKey =
  | 'camera'
  | 'media'
  | 'location'
  | 'notifications'
  | 'microphone'

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
  if (status === Notifications.PermissionStatus.DENIED) {
    return canAskAgain ? 'denied' : 'blocked'
  }

  if (status === Notifications.PermissionStatus.GRANTED) {
    if (options?.provisional) {
      return 'provisional'
    }

    if (options?.limited) {
      return 'limited'
    }

    return 'granted'
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

  const limited = permission.accessPrivileges === 'limited'

  const getDetails = () => {
    if (limited) {
      return 'Limited media access'
    }

    if (permission.granted) {
      return 'Media library available'
    }
    return 'Media permission needed'
  }

  return {
    details: getDetails(),
    state: mapExpoPermission(permission.status, permission.canAskAgain, {
      limited,
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
    details: permission.granted
      ? 'Location ready'
      : 'Location permission needed',
    state: mapExpoPermission(permission.status, permission.canAskAgain),
  }
}

async function loadNotificationCapability(): Promise<CapabilityModel> {
  const permission = await Notifications.getPermissionsAsync()

  const provisional =
    permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL

  const getDetails = () => {
    if (provisional) {
      return 'Provisional notification auth'
    }
    if (permission.granted) {
      return 'Notifications enabled'
    }
    return 'Notifications permission needed'
  }

  return {
    details: getDetails(),
    state: mapExpoPermission(permission.status, permission.canAskAgain, {
      provisional,
    }),
  }
}

async function loadMicrophoneCapability(): Promise<CapabilityModel> {
  const permission =
    Platform.OS === 'ios'
      ? PERMISSIONS.IOS.MICROPHONE
      : PERMISSIONS.ANDROID.RECORD_AUDIO
  const status = await check(permission)

  return {
    details:
      status === RESULTS.GRANTED
        ? 'Microphone ready'
        : 'Microphone permission needed',
    state: mapRnPermission(status),
  }
}

type CapabilityCardProps = CapabilityModel & {
  title: string
  onRefresh: () => void
  isRefreshable: boolean
}

function CapabilityCard({
  title,
  onRefresh,
  isRefreshable,
  ...model
}: CapabilityCardProps) {
  const stateColorMap: Record<CapabilityState, string> = {
    unavailable: '#6B7280',
    denied: '#DC2626',
    blocked: '#7C2D12',
    granted: '#16A34A',
    limited: '#D97706',
    provisional: '#2563EB',
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.cardState, { color: stateColorMap[model.state] }]}>
        State: {model.state}
      </Text>
      <Text style={styles.cardDetails}>{model.details}</Text>

      <View style={styles.rowActions}>
        <Pressable
          disabled={!isRefreshable}
          onPress={onRefresh}
          style={[
            styles.smallButton,
            {
              backgroundColor: isRefreshable ? '#111827' : '#1118274D',
            },
          ]}
        >
          <Text style={styles.smallButtonText}>Retry check</Text>
        </Pressable>

        {(model.state === 'denied' || model.state === 'blocked') && (
          <Pressable
            onPress={() => openSettings()}
            style={styles.smallSecondaryButton}
          >
            <Text style={styles.smallSecondaryButtonText}>Open settings</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

export default function App() {
  const insets = useSafeAreaInsets()
  const [capabilities, setCapabilities] =
    useState<CapabilityMap>(INITIAL_CAPABILITIES)
  const [refreshingCapabilities, setRefreshingCapabilities] = useState(false)

  const refreshAll = useCallback(async () => {
    setRefreshingCapabilities(true)
    try {
      const [camera, media, location, notifications, microphone] =
        await Promise.all([
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
    } finally {
      setRefreshingCapabilities(false)
    }
  }, [])

  useEffect(() => {
    void refreshAll()

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshAll()
      }
    })

    return () => subscription.remove()
  }, [refreshAll])

  const degradedCount = Object.values(capabilities).filter(
    ({ state }) => state !== 'granted'
  ).length

  const containerInsets = {
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
  }

  return (
    <View style={[styles.container, containerInsets]}>
      <Text style={styles.title}>Device Access Center</Text>
      <Text style={styles.subtitle}>
        Capabilities not fully granted: {degradedCount}
      </Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {Object.entries(capabilities).map(([key, model]) => (
          <CapabilityCard
            key={key}
            title={key}
            onRefresh={refreshAll}
            isRefreshable={!refreshingCapabilities}
            {...model}
          />
        ))}
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
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
