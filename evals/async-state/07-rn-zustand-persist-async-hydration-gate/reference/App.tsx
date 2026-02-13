import AsyncStorage from '@react-native-async-storage/async-storage'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type SessionStore = {
  hasHydrated: boolean
  token: string | null
  login: () => void
  logout: () => void
  setHasHydrated: (value: boolean) => void
}

const useSessionStore = create<SessionStore>()(
  persist(
    (set) => {
      return {
        hasHydrated: false,
        token: null,
        login: () => {
          set({ token: 'demo-token' })
        },
        logout: () => {
          set({ token: null })
        },
        setHasHydrated: (value) => {
          set({ hasHydrated: value })
        },
      }
    },
    {
      name: 'session-store',
      onRehydrateStorage: () => {
        return (state) => {
          state?.setHasHydrated(true)
        }
      },
      partialize: (state) => ({ token: state.token }),
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

function HydrationGate() {
  const hasHydrated = useSessionStore((state) => state.hasHydrated)
  const token = useSessionStore((state) => state.token)
  const login = useSessionStore((state) => state.login)
  const logout = useSessionStore((state) => state.logout)

  if (!hasHydrated) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Restoring session…</Text>
        <Text style={styles.meta}>Protected UI is gated until hydration completes.</Text>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Session gate</Text>

      {token ? (
        <View style={styles.card}>
          <Text style={styles.meta}>Authenticated content visible.</Text>
          <Pressable onPress={logout} style={styles.button}>
            <Text style={styles.buttonText}>Log out</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.meta}>Public content visible.</Text>
          <Pressable onPress={login} style={styles.button}>
            <Text style={styles.buttonText}>Log in</Text>
          </Pressable>
        </View>
      )}
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
