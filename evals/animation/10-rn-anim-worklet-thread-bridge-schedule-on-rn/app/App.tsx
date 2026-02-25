import { Pressable, StyleSheet, Text, View } from 'react-native'

type DetailRow = {
  label: string
  value: string
}

const CARD_TITLE = 'Interaction details'

const DETAILS: DetailRow[] = [
  { label: 'State', value: 'idle' },
  { label: 'Target', value: 'not implemented' },
  { label: 'Notes', value: 'fill behavior using requirement specs' },
]

function runAnimationPlaceholder() {
  // TODO: implement animation behavior for this eval
}

export default function App() {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Pressable style={styles.header} onPress={runAnimationPlaceholder}>
          <Text style={styles.title}>{CARD_TITLE}</Text>
          <Text style={styles.action}>Run</Text>
        </Pressable>

        <View style={styles.details}>
          {DETAILS.map((row) => (
            <Text key={row.label} style={styles.copy}>
              {row.label}: {row.value}
            </Text>
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  action: {
    color: '#1d4ed8',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  copy: {
    color: '#334155',
    fontSize: 14,
    marginBottom: 6,
  },
  details: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  screen: {
    backgroundColor: '#eef2ff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
})
