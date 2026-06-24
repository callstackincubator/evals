import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [status, setStatus] = useState('Not registered.')

  const register = async () => {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          importance: Notifications.AndroidImportance.MAX,
          name: 'Default',
        })
      }
      const permission = await Notifications.requestPermissionsAsync()
      if (!permission.granted) {
        setStatus('Notification permission denied.')
        return
      }
      const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId
      if (!projectId) {
        setStatus('Missing EAS project id.')
        return
      }
      const token = await Notifications.getExpoPushTokenAsync({ projectId })
      setStatus(token.data)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Token registration failed.')
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Push token</Text>
      <Text style={styles.subtitle}>{status}</Text>
      <Pressable onPress={register} style={styles.action}><Text style={styles.actionText}>Register</Text></Pressable>
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
