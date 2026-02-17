import { StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'

type CarouselCard = {
  color: string
  id: string
  title: string
}

type FeedRow =
  | { body: string; id: string; type: 'story' }
  | { cards: CarouselCard[]; id: string; type: 'carousel' }

const DATA: FeedRow[] = [
  { body: 'Top story', id: 'story-1', type: 'story' },
  {
    cards: [
      { color: '#bfdbfe', id: 'card-1', title: 'Mountains' },
      { color: '#fde68a', id: 'card-2', title: 'Beach' },
      { color: '#fecaca', id: 'card-3', title: 'City' },
    ],
    id: 'carousel-1',
    type: 'carousel',
  },
  { body: 'Another article', id: 'story-2', type: 'story' },
]

function CarouselCardItem({ card }: { card: CarouselCard }) {
  return (
    <View style={styles.card}>
      <View style={[styles.cardImage, { backgroundColor: card.color }]} />
      <Text style={styles.cardTitle}>{card.title}</Text>
    </View>
  )
}

function renderCarouselCard({ item }: { item: CarouselCard }) {
  return <CarouselCardItem card={item} />
}

function HorizontalCarousel({ cards }: { cards: CarouselCard[] }) {
  return (
    <FlashList
      data={cards}
      getItemType={() => 'card'}
      horizontal
      keyExtractor={(item) => item.id}
      renderItem={renderCarouselCard}
      showsHorizontalScrollIndicator={false}
    />
  )
}

function StoryRow({ body }: { body: string }) {
  return (
    <View style={styles.storyRow}>
      <Text style={styles.storyText}>{body}</Text>
    </View>
  )
}

function CarouselFeedRow({ cards }: { cards: CarouselCard[] }) {
  return (
    <View style={styles.carouselRow}>
      <Text style={styles.sectionTitle}>Featured</Text>
      <HorizontalCarousel cards={cards} />
    </View>
  )
}

function renderFeedRow({ item }: { item: FeedRow }) {
  if (item.type === 'carousel') {
    return <CarouselFeedRow cards={item.cards} />
  }

  return <StoryRow body={item.body} />
}

export default function App() {
  return (
    <View style={styles.container}>
      <FlashList
        data={DATA}
        getItemType={(item) => item.type}
        keyExtractor={(item) => item.id}
        renderItem={renderFeedRow}
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
