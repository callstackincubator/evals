import AsyncStorage from '@react-native-async-storage/async-storage'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const STORE_NAME = 'session-store'

type ProfileStatus = 'idle' | 'loading' | 'ready' | 'error'

type SessionStore = {
  hasHydrated: boolean
  profileName: string | null
  profileStatus: ProfileStatus
  token: string | null
  login: () => Promise<void>
  logout: () => void
  loadProfile: () => Promise<void>
  setHasHydrated: (value: boolean) => void
}

async function fetchSessionToken(): Promise<string> {
  const response = await fetch('https://dummyjson.com/auth/login', {
    body: JSON.stringify({
      expiresInMins: 30,
      password: 'emilyspass',
      username: 'emilys',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const json = (await response.json()) as {
    accessToken?: string
    token?: string
  }

  const token = json.accessToken ?? json.token

  if (!token) {
    throw new Error('Token missing in auth response')
  }

  return token
}

async function fetchProfileName(token: string): Promise<string> {
  const response = await fetch('https://dummyjson.com/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const json = (await response.json()) as {
    firstName: string
    lastName: string
  }

  return `${json.firstName} ${json.lastName}`
}

const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      profileName: null,
      profileStatus: 'idle',
      token: null,
      login: async () => {
        set({ profileStatus: 'loading' })

        try {
          const token = await fetchSessionToken()
          set({ token })
          await get().loadProfile()
        } catch {
          set({ profileName: null, profileStatus: 'error', token: null })
        }
      },
      logout: () => {
        set({ profileName: null, profileStatus: 'idle', token: null })
      },
      loadProfile: async () => {
        const token = get().token

        if (!token) {
          return
        }

        set({ profileStatus: 'loading' })

        try {
          const profileName = await fetchProfileName(token)
          set({ profileName, profileStatus: 'ready' })
        } catch {
          set({ profileName: null, profileStatus: 'error' })
        }
      },
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: STORE_NAME,
      onRehydrateStorage: () => (state, error) => {
        if (!state || error) {
          useSessionStore.getState().setHasHydrated(true)
          return
        }

        state.setHasHydrated(true)

        if (state.token) {
          void state.loadProfile()
        }
      },
      partialize: (state) => ({ token: state.token }),
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

function HydrationGate() {
  const hasHydrated = useSessionStore((state) => state.hasHydrated)
  const profileName = useSessionStore((state) => state.profileName)
  const profileStatus = useSessionStore((state) => state.profileStatus)
  const token = useSessionStore((state) => state.token)
  const login = useSessionStore((state) => state.login)
  const logout = useSessionStore((state) => state.logout)

  if (!hasHydrated) {
    return (
      <View style={styles.screen}>
        <Text style={styles.meta}>Loading your session...</Text>
      </View>
    )
  }

  if (token && profileStatus === 'loading') {
    return (
      <View style={styles.screen}>
        <Text style={styles.meta}>Loading profile...</Text>
      </View>
    )
  }

  const card = token
    ? {
        button: 'Log out',
        label: `Authenticated as ${profileName ?? 'unknown user'}`,
        action: logout,
      }
    : { label: 'Public content visible.', action: login, button: 'Log in' }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Session Gate</Text>

      <View style={styles.card}>
        <Text style={styles.meta}>{card.label}</Text>

        {profileStatus === 'error' ? (
          <Text style={styles.error}>Token or profile request failed.</Text>
        ) : null}

        <Pressable onPress={card.action} style={styles.button}>
          <Text style={styles.buttonText}>{card.button}</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default function App() {
  return <HydrationGate />
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 12,
    padding: 12,
  },
  error: {
    color: '#b91c1c',
    marginTop: 6,
  },
  meta: {
    color: '#334155',
  },
  screen: {
    backgroundColor: '#f1f5f9',
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 56,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
  },
})
