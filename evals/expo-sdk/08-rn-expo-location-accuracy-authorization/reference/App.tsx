import * as Location from 'expo-location'
import { useState } from 'react'
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [permission, setPermission] =
    useState<Location.LocationPermissionResponse | null>(null)

  const handleRefresh = async () => {
    setPermission(await Location.requestForegroundPermissionsAsync())
  }

  const permissionStatus = permission?.status ?? 'undetermined'
  // iOS exposes a full/reduced accuracy authorization; Android exposes
  // fine/coarse accuracy. A granted permission can still be approximate,
  // so do not assume precise.
  const androidAccuracy = permission?.android?.accuracy
  const iosAccuracy = permission?.ios?.accuracy
  const preciseAccuracy = androidAccuracy === 'fine' || iosAccuracy === 'full'
  const accuracyDetail =
    androidAccuracy ?? (iosAccuracy ? `iOS ${iosAccuracy}` : undefined)
  const blocked =
    permission != null && !permission.granted && !permission.canAskAgain

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Location Status</Text>

      <View style={styles.card}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Permission</Text>
          <Text style={styles.statusValue}>{permissionStatus}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Accuracy</Text>
          <Text style={styles.statusValue}>
            {preciseAccuracy ? 'Precise' : 'Approximate'}
          </Text>
        </View>
        {!preciseAccuracy && permission?.granted ? (
          <Text style={styles.note}>
            Only approximate location is available
            {accuracyDetail ? ` (${accuracyDetail})` : ''}.
          </Text>
        ) : null}
      </View>

      <Pressable style={styles.button} onPress={handleRefresh}>
        <Text style={styles.buttonText}>Refresh Status</Text>
      </Pressable>

      {blocked ? (
        <Pressable style={styles.button} onPress={() => Linking.openSettings()}>
          <Text style={styles.buttonText}>Open Settings</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    rowGap: 12,
  },
  note: {
    color: '#6b7280',
    fontSize: 13,
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    rowGap: 16,
  },
  statusLabel: {
    color: '#6b7280',
    fontSize: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusValue: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
  },
})
