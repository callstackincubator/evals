/**
 * Two-step provisional notification upgrade flow:
 *
 * Step 1 — requestProvisional: calls requestPermissionsAsync with allowProvisional: true.
 *   iOS grants this silently without showing a system dialog. The user lands in 'provisional'
 *   state where notifications are delivered quietly to Notification Center only (no banners,
 *   no sounds). This is the iOS-recommended low-friction entry point.
 *
 * Step 2 — upgradeToFull: calls requestPermissionsAsync without allowProvisional. This surfaces
 *   the actual iOS system dialog ("Allow / Don't Allow"). Must only be called after the app has
 *   had a chance to demonstrate value in provisional mode — hence the separate button that only
 *   appears in 'provisional' state. Result is either 'granted' or 'denied'.
 *
 * Keeping the two requests separate is intentional: merging them into one would either skip
 * provisional entirely (if allowProvisional is omitted) or never show the system dialog
 * (if allowProvisional causes iOS to resolve silently every time).
 *
 * Conventions aligned with 08 and 09 refactor:
 * - No StatusBar (unrelated to prompt/requirements).
 * - No useCallback memoization; handlers are plain async functions.
 * - Use direct handler references (e.g. onPress={refreshStatus}) instead of arrow wrappers where applicable.
 * - requestProvisionalNotificationsPermissions uses switch (nextState) instead of if-else for state handling.
 */

import * as Notifications from 'expo-notifications'
import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type NotificationState = 'not-determined' | 'denied' | 'provisional' | 'granted'

function mapPermissionState(
  permission: Notifications.NotificationPermissionsStatus
): NotificationState {
  const iosStatus = permission.ios?.status

  if (iosStatus === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return 'provisional'
  }

  if (permission.status === Notifications.PermissionStatus.GRANTED) {
    return 'granted'
  }

  if (permission.status === Notifications.PermissionStatus.DENIED) {
    return 'denied'
  }

  return 'not-determined'
}

function getStatusText(state: NotificationState): string {
  switch (state) {
    case 'granted':
      return 'Full authorization'
    case 'provisional':
      return 'Provisional authorization (degraded but usable)'
    case 'denied':
      return 'Denied'
    default:
      return 'Not determined'
  }
}

function getCardBody(state: NotificationState): string {
  switch (state) {
    case 'granted':
      return 'All notification features enabled.'
    case 'provisional':
      return 'Only provisional-safe notification UX is enabled.'
    default:
      return 'Notification-dependent actions are disabled.'
  }
}

export default function App() {
  const [state, setState] = useState<NotificationState>('not-determined')
  const [message, setMessage] = useState(
    'Request provisional access to get started without a system prompt.'
  )

  const refreshStatus = async () => {
    const permission = await Notifications.getPermissionsAsync()
    setState(mapPermissionState(permission))
  }

  const requestProvisionalNotificationsPermissions = async () => {
    const permission = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowProvisional: true,
        allowSound: true,
      },
    })

    const nextState = mapPermissionState(permission)
    setState(nextState)

    switch (nextState) {
      case 'provisional':
        setMessage(
          'Notifications are delivered quietly for now. Upgrade for banners and sounds.'
        )
        break
      case 'granted':
        setMessage('Full notification authorization granted.')
        break
      case 'denied':
        setMessage('Notifications denied. Open Settings to re-enable.')
        break
      default:
        setMessage('Status still not determined.')
    }
  }

  const requestFullNotificationsPermissions = async () => {
    const permission = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    })

    const nextState = mapPermissionState(permission)
    setState(nextState)

    if (nextState === 'granted') {
      setMessage('Full notification authorization granted.')
    } else {
      setMessage('Upgrade declined. Provisional delivery remains active.')
    }

  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>iOS Notification Permission Gate</Text>
      <Text style={styles.status}>{getStatusText(state)}</Text>

      {state === 'not-determined' && (
        <Pressable
          onPress={requestProvisionalNotificationsPermissions}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Enable notifications</Text>
        </Pressable>
      )}

      {state === 'provisional' && (
        <Pressable
          onPress={requestFullNotificationsPermissions}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Upgrade to full notifications</Text>
        </Pressable>
      )}

      <Pressable onPress={refreshStatus} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Refresh status</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Feature mode</Text>
        <Text style={styles.cardBody}>{getCardBody(state)}</Text>
      </View>

      <Text style={styles.message}>{message}</Text>
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
  card: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    width: '100%',
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  cardBody: {
    color: '#4b5563',
  },
  message: {
    color: '#111827',
    textAlign: 'center',
  },
})
