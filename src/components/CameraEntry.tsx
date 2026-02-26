import { useState, useEffect } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'

export default function CameraEntry() {
  const [facing, setFacing] = useState<'back' | 'front'>('back')
  const [permission, requestPermission] = useCameraPermissions()
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown')

  useEffect(() => {
    if (!permission) return
    if (!permission.granted) {
      requestPermission()
    }
  }, [permission])

  useEffect(() => {
    if (permission?.granted) {
      setPermissionStatus('granted')
    } else if (permission?.denied) {
      setPermissionStatus('denied')
    }
  }, [permission])

  const handleRetry = async () => {
    const newPermission = await requestPermission()
    if (newPermission.granted) {
      setPermissionStatus('granted')
    } else {
      setPermissionStatus('denied')
    }
  }

  const goToSettings = () => {
    Alert.alert(
      'Camera Access',
      'Please enable camera access in your app settings to use this feature.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go to Settings',
          onPress: () => Linking.openSettings(),
        },
      ],
      { cancelable: true }
    )
  }

  const handleAskPermission = async () => {
    const newPermission = await requestPermission()
    if (newPermission.granted) {
      setPermissionStatus('granted')
    }
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Loading camera...</Text>
      </View>
    )
  }

  if (permissionStatus === 'denied') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera Access Required</Text>
        <Text style={styles.description}>
          This app needs camera access to capture photos. You have previously
          denied camera access.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleRetry}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={goToSettings}>
          <Text style={styles.buttonText}>Go to Settings</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (permissionStatus === 'unknown') {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
        <TouchableOpacity style={styles.button} onPress={handleAskPermission}>
          <Text style={styles.buttonText}>Allow Camera Access</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} />
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
        >
          <Text style={styles.buttonText}>Flip Camera</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 200,
  },
  secondaryButton: {
    backgroundColor: '#E5E5EA',
    padding: 16,
    borderRadius: 12,
    minWidth: 200,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  camera: {
    flex: 1,
    borderRadius: 12,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
})
