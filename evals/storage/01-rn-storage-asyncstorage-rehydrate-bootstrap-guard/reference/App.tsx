import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'

type Session = {
  token: string
  userId: string
}

type Draft = {
  body: string
  updatedAt: number
}

type BootstrapState = {
  draft: Draft
  session: Session | null
}

const SESSION_KEY = 'app:session'
const DRAFT_KEY = 'app:draft'

const EMPTY_DRAFT: Draft = {
  body: '',
  updatedAt: 0,
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function parseSession(value: string | null): Session | null {
  const parsed = safeParse<Partial<Session> | null>(value, null)
  if (!parsed) {
    return null
  }

  if (typeof parsed.token !== 'string' || typeof parsed.userId !== 'string') {
    return null
  }

  return {
    token: parsed.token,
    userId: parsed.userId,
  }
}

function parseDraft(value: string | null): Draft {
  const parsed = safeParse<Partial<Draft>>(value, EMPTY_DRAFT)

  return {
    body: typeof parsed.body === 'string' ? parsed.body : '',
    updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0,
  }
}

async function bootstrapState(): Promise<BootstrapState> {
  const pairs = await AsyncStorage.multiGet([SESSION_KEY, DRAFT_KEY])
  const values = Object.fromEntries(pairs)

  return {
    draft: parseDraft(values[DRAFT_KEY] ?? null),
    session: parseSession(values[SESSION_KEY] ?? null),
  }
}

export default function App() {
  const [isHydrating, setIsHydrating] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)

  useEffect(() => {
    let cancelled = false

    const runBootstrap = async () => {
      try {
        const next = await bootstrapState()
        if (cancelled) {
          return
        }

        setSession(next.session)
        setDraft(next.draft)
      } catch {
        if (!cancelled) {
          setSession(null)
          setDraft(EMPTY_DRAFT)
        }
      } finally {
        if (!cancelled) {
          setIsHydrating(false)
        }
      }
    }

    runBootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  if (isHydrating) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size='large' />
        <Text style={styles.helper}>Restoring persisted state...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hydration Complete</Text>
      <Text style={styles.row}>Session: {session ? session.userId : 'Guest'}</Text>
      <Text style={styles.row}>Draft chars: {draft.body.length}</Text>
      <Pressable
        style={styles.button}
        onPress={async () => {
          const nextDraft: Draft = {
            body: `${draft.body}*`,
            updatedAt: Date.now(),
          }
          setDraft(nextDraft)
          await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(nextDraft))
        }}
      >
        <Text style={styles.buttonText}>Append Draft</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1f4fd1',
    borderRadius: 10,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#f4f6fb',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  helper: {
    color: '#5e6580',
    marginTop: 12,
  },
  row: {
    color: '#202539',
    marginTop: 8,
  },
  title: {
    color: '#101425',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
})
