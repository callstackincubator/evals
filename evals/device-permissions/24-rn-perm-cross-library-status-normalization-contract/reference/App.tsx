import { Camera } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useMemo, useState } from 'react'
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { check, PERMISSIONS, RESULTS, type PermissionStatus } from 'react-native-permissions'

export type NormalizedStatus =
  | 'unavailable'
  | 'denied'
  | 'blocked'
  | 'granted'
  | 'limited'
  | 'provisional'

type DiagnosticRow = {
  source: string
  normalized: NormalizedStatus
  note: string
}

function mapExpoPermission(params: {
  status: Notifications.PermissionStatus
  canAskAgain?: boolean
  limited?: boolean
  provisional?: boolean
}): NormalizedStatus {
  if (params.status === Notifications.PermissionStatus.GRANTED) {
    if (params.provisional) {
      return 'provisional'
    }

    if (params.limited) {
      return 'limited'
    }

    return 'granted'
  }

  if (params.status === Notifications.PermissionStatus.DENIED) {
    return params.canAskAgain === false ? 'blocked' : 'denied'
  }

  return 'unavailable'
}

function mapRnPermission(status: PermissionStatus): NormalizedStatus {
  if (status === RESULTS.UNAVAILABLE) {
    return 'unavailable'
  }

  if (status === RESULTS.BLOCKED) {
    return 'blocked'
  }

  if (status === RESULTS.GRANTED) {
    return 'granted'
  }

  if (status === RESULTS.LIMITED) {
    return 'limited'
  }

  if (status === RESULTS.DENIED) {
    return 'denied'
  }

  return 'unavailable'
}

export default function App() {
  const [rows, setRows] = useState<DiagnosticRow[]>([])

  const runDiagnostics = useCallback(async () => {
    const [camera, media, notifications, rnCamera] = await Promise.all([
      Camera.getCameraPermissionsAsync(),
      ImagePicker.getMediaLibraryPermissionsAsync(),
      Notifications.getPermissionsAsync(),
      check(Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA),
    ])

    const nextRows: DiagnosticRow[] = [
      {
        source: 'expo-camera',
        normalized: mapExpoPermission({
          canAskAgain: camera.canAskAgain,
          status: camera.status,
        }),
        note: camera.granted ? 'Camera access granted' : 'Camera access not granted',
      },
      {
        source: 'expo-image-picker',
        normalized: mapExpoPermission({
          canAskAgain: media.canAskAgain,
          limited: media.accessPrivileges === 'limited',
          status: media.status,
        }),
        note:
          media.accessPrivileges === 'limited'
            ? 'Limited media access reported'
            : 'Standard media permission path',
      },
      {
        source: 'expo-notifications',
        normalized: mapExpoPermission({
          canAskAgain: notifications.canAskAgain,
          provisional: notifications.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL,
          status: notifications.status,
        }),
        note: 'Mapped from iOS/Expo notification status model',
      },
      {
        source: 'react-native-permissions(camera)',
        normalized: mapRnPermission(rnCamera),
        note: 'Mapped from RESULTS enum',
      },
    ]

    setRows(nextRows)
  }, [])

  const summary = useMemo(() => {
    if (rows.length === 0) {
      return 'No diagnostics run yet.'
    }

    const blockedCount = rows.filter((row) => row.normalized === 'blocked').length
    const unavailableCount = rows.filter((row) => row.normalized === 'unavailable').length

    return `blocked: ${blockedCount}, unavailable: ${unavailableCount}, total: ${rows.length}`
  }, [rows])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Permissions Diagnostics</Text>
      <Text style={styles.summary}>{summary}</Text>

      <Pressable onPress={runDiagnostics} style={styles.button}>
        <Text style={styles.buttonText}>Run normalized checks</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {rows.map((row) => (
          <View key={row.source} style={styles.card}>
            <Text style={styles.cardTitle}>{row.source}</Text>
            <Text style={styles.cardState}>Normalized: {row.normalized}</Text>
            <Text style={styles.cardNote}>{row.note}</Text>
          </View>
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
    paddingTop: 64,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 16,
  },
  summary: {
    color: '#4b5563',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
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
    rowGap: 4,
  },
  cardTitle: {
    fontWeight: '600',
  },
  cardState: {
    color: '#111827',
  },
  cardNote: {
    color: '#4b5563',
  },
})
