import { Suspense } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { atom, useAtomValue } from 'jotai'

const FETCH_DELAY_MS = 260

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

type Profile = {
  id: string
  name: string
  role: string
}

const MOCK_PROFILE: Profile = {
  id: 'p-1',
  name: 'Jordan Lee',
  role: 'Release engineer',
}

const profileAtom = atom(async () => {
  await sleep(FETCH_DELAY_MS)

  return MOCK_PROFILE
})

function ProfileCard() {
  const profile = useAtomValue(profileAtom)

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{profile.name}</Text>
      <Text style={styles.meta}>{profile.role}</Text>
    </View>
  )
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Async State</Text>

      <Suspense
        fallback={
          <View style={styles.card}>
            <Text style={styles.meta}>Loading profile…</Text>
          </View>
        }
      >
        <ProfileCard />
      </Suspense>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 12,
    padding: 14,
  },
  meta: {
    color: '#334155',
  },
  name: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
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
