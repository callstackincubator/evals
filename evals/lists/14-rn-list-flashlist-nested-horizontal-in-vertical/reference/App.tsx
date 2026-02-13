import { Image, StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'

type CarouselCard = {
  id: string
  title: string
  uri: string
}

type FeedRow =
  | { body: string; id: string; type: 'story' }
  | { cards: CarouselCard[]; id: string; type: 'carousel' }

const DATA: FeedRow[] = [
  { body: 'Top story', id: 'story-1', type: 'story' },
  {
    cards: [
      { id: 'card-1', title: 'Mountains', uri: 'https://picsum.photos/260/160?1' },
      { id: 'card-2', title: 'Beach', uri: 'https://picsum.photos/260/160?2' },
      { id: 'card-3', title: 'City', uri: 'https://picsum.photos/260/160?3' },
    ],
    id: 'carousel-1',
    type: 'carousel',
  },
  { body: 'Another article', id: 'story-2', type: 'story' },
]

function HorizontalCarousel({ cards }: { cards: CarouselCard[] }) {
  return (
    <FlashList
      data={cards}
      estimatedItemSize={200}
      horizontal
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image source={{ uri: item.uri }} style={styles.cardImage} />
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
      )}
      showsHorizontalScrollIndicator={false}
    />
  )
}

export default function App() {
  return (
    <View style={styles.container}>
      <FlashList
        data={DATA}
        estimatedItemSize={140}
        getItemType={(item) => item.type}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.type === 'carousel') {
            return (
              <View style={styles.carouselRow}>
                <Text style={styles.sectionTitle}>Featured</Text>
                <HorizontalCarousel cards={item.cards} />
              </View>
            )
          }

          return (
            <View style={styles.storyRow}>
              <Text style={styles.storyText}>{item.body}</Text>
            </View>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginRight: 10,
    width: 220,
  },
  cardImage: {
    borderRadius: 10,
    height: 130,
    width: 220,
  },
  cardTitle: {
    color: '#111827',
    fontWeight: '600',
    marginTop: 6,
  },
  carouselRow: {
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 56,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  storyRow: {
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  storyText: {
    color: '#111827',
    fontSize: 16,
  },
})
