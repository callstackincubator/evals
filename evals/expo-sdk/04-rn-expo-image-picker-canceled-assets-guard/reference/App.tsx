import * as ImagePicker from 'expo-image-picker'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [assetUri, setAssetUri] = useState<string | null>(null)
  const [message, setMessage] = useState('No image selected.')

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ['images'],
      quality: 0.8,
    })
    if (result.canceled || !result.assets?.length) {
      setAssetUri(null)
      setMessage('Selection canceled.')
      return
    }
    setAssetUri(result.assets[0].uri)
    setMessage(result.assets[0].fileName ?? 'Image selected.')
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Image picker</Text>
      {assetUri ? <Image source={{ uri: assetUri }} style={styles.media} /> : <Text style={styles.subtitle}>{message}</Text>}
      <Pressable onPress={pick} style={styles.action}><Text style={styles.actionText}>Choose image</Text></Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  action: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionText: {
    color: '#fff',
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
  media: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    height: 180,
    overflow: 'hidden',
    width: '100%',
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 12,
  },
  subtitle: {
    color: '#4b5563',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
})
