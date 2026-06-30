import { Pressable, StyleSheet, Text, View } from 'react-native'

type PermissionState = 'undetermined' | 'granted' | 'denied'

export default function App() {
  const permissionState: PermissionState = 'undetermined'

  const handleRequestPermission = () => {}
  const handleOpenSettings = () => {}

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Camera</Text>

      <View style={styles.preview}>
        <Text style={styles.previewText}>Camera is off</Text>
      </View>

      {permissionState === 'denied' ? (
        <View style={styles.statusBlock}>
          <Text style={styles.statusText}>
            Camera access is turned off. Enable it in Settings to continue.
          </Text>
          <Pressable style={styles.button} onPress={handleOpenSettings}>
            <Text style={styles.buttonText}>Open Settings</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.button} onPress={handleRequestPermission}>
          <Text style={styles.buttonText}>Enable Camera</Text>
        </Pressable>
      )}
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
  preview: {
    alignItems: 'center',
    aspectRatio: 3 / 4,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    justifyContent: 'center',
    width: '100%',
  },
  previewText: {
    color: '#9ca3af',
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    rowGap: 16,
  },
  statusBlock: {
    alignItems: 'center',
    rowGap: 10,
  },
  statusText: {
    color: '#6b7280',
    textAlign: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
  },
})
