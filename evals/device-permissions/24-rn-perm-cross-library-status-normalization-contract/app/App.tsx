import { Camera } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { RESULTS, type PermissionStatus } from 'react-native-permissions'

type NormalizedStatus = 'unavailable' | 'denied' | 'blocked' | 'granted' | 'limited' | 'provisional'

type DiagnosticRow = {
  source: string
  normalized: NormalizedStatus
}

function normalizePermissionStatus(status: PermissionStatus): NormalizedStatus {
  // TODO: normalize cross-library status models
  switch (status) {
    case RESULTS.GRANTED:
      return 'granted'
    case RESULTS.DENIED:
      return 'denied'
    case RESULTS.BLOCKED:
      return 'blocked'
    case RESULTS.LIMITED:
      return 'limited'
    default:
      return 'unavailable'
  }
}

async function runDiagnosticsPlaceholder() {
  // TODO: collect and normalize permissions diagnostics
  await Camera.getCameraPermissionsAsync()
  await ImagePicker.getMediaLibraryPermissionsAsync()
  await Location.getForegroundPermissionsAsync()
  await Notifications.getPermissionsAsync()

  const rows: DiagnosticRow[] = []
  void normalizePermissionStatus
  return rows
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Cross-library Permissions Starter</Text>
      <Pressable style={styles.button} onPress={() => void runDiagnosticsPlaceholder()}>
        <Text style={styles.buttonText}>Run diagnostics placeholder</Text>
      </Pressable>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} />
      <StatusBar style='auto' />
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
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    rowGap: 10,
  },
  scroll: {
    maxHeight: 120,
  },
  scrollContent: {
    rowGap: 8,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
})
