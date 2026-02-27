import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

type Post = {
  id: string
  title: string
}

type SubmitState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'error'; message: string }

const draftAtom = atom('')
const postsAtom = atom<Post[]>([])
const submitStateAtom = atom<SubmitState>({ status: 'idle' })

async function createPost(title: string): Promise<Post> {
  const response = await fetch('https://dummyjson.com/posts/add', {
    body: JSON.stringify({
      body: 'Created from Jotai mutation',
      title,
      userId: 1,
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
    id: number
    title: string
  }

  return {
    id: String(json.id),
    title: json.title,
  }
}

const submitPostAtom = atom(null, async (_, set, title: string) => {
  const nextTitle = title.trim()

  if (!nextTitle) {
    return
  }

  set(submitStateAtom, { status: 'pending' })

  try {
    const created = await createPost(nextTitle)
    set(submitStateAtom, { status: 'idle' })
    set(postsAtom, (previous) => [created, ...previous])
    set(draftAtom, '')
  } catch (error) {
    set(submitStateAtom, {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

export default function App() {
  const [draft, setDraft] = useAtom(draftAtom)
  const posts = useAtomValue(postsAtom)
  const submitStatus = useAtomValue(submitStateAtom)
  const submitPost = useSetAtom(submitPostAtom)

  const pending = submitStatus.status === 'pending'

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Post Composer</Text>

      <View style={styles.row}>
        <TextInput
          onChangeText={setDraft}
          placeholder='Post title'
          placeholderTextColor='#94a3b8'
          style={styles.input}
          value={draft}
        />
        <Pressable
          disabled={pending}
          onPress={() => {
            submitPost(draft)
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{pending ? 'Saving…' : 'Save'}</Text>
        </Pressable>
      </View>

      {submitStatus.status === 'error' ? (
        <Text style={styles.error}>{submitStatus.message}</Text>
      ) : null}

      {posts.map((post) => {
        return (
          <View key={post.id} style={styles.item}>
            <Text>{post.title}</Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  error: {
    color: '#b91c1c',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    color: '#0f172a',
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    marginTop: 12,
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
