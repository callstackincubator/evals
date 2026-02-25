import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'

type Post = {
  id: string
  title: string
}

const draftAtom = atom('')
const postsAtom = atom<Post[]>([])
const pendingAtom = atom(false)
const errorAtom = atom<string | null>(null)

async function createPost(title: string): Promise<Post> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 240)
  })

  if (title.toLowerCase().includes('fail')) {
    throw new Error('Server rejected title')
  }

  return {
    id: `post-${Date.now()}`,
    title,
  }
}

const submitPostAtom = atom(null, async (get, set, title: string) => {
  const nextTitle = title.trim()
  if (!nextTitle) {
    return
  }

  set(pendingAtom, true)
  set(errorAtom, null)

  try {
    const created = await createPost(nextTitle)
    set(postsAtom, (previous) => [created, ...previous])
    set(draftAtom, '')
  } catch (error) {
    set(errorAtom, error instanceof Error ? error.message : 'Unknown error')
  } finally {
    set(pendingAtom, false)
  }
})

export default function App() {
  const [draft, setDraft] = useAtom(draftAtom)
  const posts = useAtomValue(postsAtom)
  const pending = useAtomValue(pendingAtom)
  const submitError = useAtomValue(errorAtom)
  const submitPost = useSetAtom(submitPostAtom)

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

      {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

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
