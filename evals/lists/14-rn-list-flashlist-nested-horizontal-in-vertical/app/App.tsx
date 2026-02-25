import { Pressable, StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'

type Row = {
  id: string
  title: string
}

const MIXED_ROWS: Row[] = [
  {
    id: 'story-1',
    title: 'Story: Top headline',
  },
  {
    id: 'carousel-1',
    title: 'Carousel: Mountains, Beach, City',
  },
  {
    id: 'story-2',
    title: 'Story: Daily recap',
  },
]

function renderNestedCarouselPlaceholder() {
  // TODO: implement list behavior for this eval
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mixed Feed</Text>
      <Text style={styles.helper}>
        Story and carousel data are seeded. Add nested list behavior for this
        eval.
      </Text>
      <Pressable
        style={styles.button}
        onPress={renderNestedCarouselPlaceholder}
      >
        <Text style={styles.buttonText}>Call placeholder</Text>
      </Pressable>
      <FlashList
        data={MIXED_ROWS}
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
