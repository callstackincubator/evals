import { atom, useAtom, useAtomValue } from 'jotai'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

type Post = {
  id: string
  title: string
}

const draftAtom = atom('')
const postsAtom = atom<Post[]>([])

export default function App() {
  const [draft, setDraft] = useAtom(draftAtom)
  const posts = useAtomValue(postsAtom)

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
          onPress={() => {}}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Save</Text>
        </Pressable>
      </View>

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
