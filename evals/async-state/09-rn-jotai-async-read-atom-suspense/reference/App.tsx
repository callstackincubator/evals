import { Suspense } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { atom, useAtomValue } from 'jotai'

type Profile = {
  id: string
  name: string
  role: string
}

const profileAtom = atom(async (): Promise<Profile> => {
  const response = await fetch('https://dummyjson.com/users/1')

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const json = (await response.json()) as {
    firstName: string
    id: number
    lastName: string
  }

  return {
    id: String(json.id),
    name: `${json.firstName} ${json.lastName}`,
    role: 'User profile',
  }
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
      <Text style={styles.title}>Profile</Text>

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
