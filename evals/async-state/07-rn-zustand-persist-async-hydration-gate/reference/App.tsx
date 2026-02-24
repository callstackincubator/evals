import AsyncStorage from '@react-native-async-storage/async-storage'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const STORE_NAME = 'session-store'
const DEMO_TOKEN = 'demo-token'

type SessionStore = {
  hasHydrated: boolean
  token: string | null
  login: () => void
  logout: () => void
  setHasHydrated: (value: boolean) => void
}

const onRehydrate = (state: SessionStore | undefined, error: unknown) => {
  if (error || !state) {
    useSessionStore.getState().setHasHydrated(true)
    return
  }

  state.setHasHydrated(true)
}

const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      hasHydrated: false,
      token: null,
      login: () => set({ token: DEMO_TOKEN }),
      logout: () => set({ token: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: STORE_NAME,
      onRehydrateStorage: () => onRehydrate,
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

  const card = token
    ? { label: 'Authenticated content visible.', action: logout, button: 'Log out' }
    : { label: 'Public content visible.', action: login, button: 'Log in' }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Session gate</Text>

      <View style={styles.card}>
        <Text style={styles.meta}>{card.label}</Text>
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
