import { Pressable, StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'

type Row = {
  id: string
  title: string
}

const ARTICLE_ROWS: Row[] = Array.from({ length: 24 }, (_, index) => ({
  id: 'article-' + String(index + 1),
  title: 'Headline ' + String(index + 1),
}))

function toggleExpandedArticlePlaceholder() {
  // TODO: implement list behavior for this eval
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Expandable Articles</Text>
      <Text style={styles.helper}>
        Article rows are seeded. Add recycling-safe transient state behavior.
      </Text>
      <Pressable
        style={styles.button}
        onPress={toggleExpandedArticlePlaceholder}
      >
        <Text style={styles.buttonText}>Call placeholder</Text>
      </Pressable>
      <FlashList
        data={ARTICLE_ROWS}
        estimatedItemSize={56}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#111827',
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 56,
  },
  header: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 12,
  },
  helper: {
    color: '#6b7280',
    marginBottom: 10,
    marginHorizontal: 12,
    marginTop: 6,
  },
  row: {
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  rowTitle: {
    color: '#111827',
    fontSize: 15,
  },
})
