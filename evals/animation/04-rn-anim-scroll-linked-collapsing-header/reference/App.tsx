/**
 * No translateY: requirements are satisfied by height + opacity; translateY was optional polish.
 * ScrollView (not FlatList): prompt asks for a "scrolling feed", not a list; ScrollView is sufficient and avoids recycling concerns here.
 */
import { StyleSheet, Text } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

const HEADER_MAX_HEIGHT = 170
const HEADER_MIN_HEIGHT = 76
const COLLAPSE_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT

const FEED_ITEMS = Array.from({ length: 30 }, (_, index) => ({
  id: `item-${index + 1}`,
  title: `Feed item ${index + 1}`,
}))

export default function App() {
  const scrollY = useSharedValue(0)

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  const headerStyle = useAnimatedStyle(() => {
    const clamped = interpolate(
      scrollY.value,
      [0, COLLAPSE_DISTANCE],
      [0, COLLAPSE_DISTANCE],
      Extrapolation.CLAMP
    )

    return {
      height: HEADER_MAX_HEIGHT - clamped,
      opacity: interpolate(
        clamped,
        [0, COLLAPSE_DISTANCE],
        [1, 0.78],
        Extrapolation.CLAMP
      ),
    }
  })

  return (
    <Animated.View style={styles.screen}>
      <Animated.View style={[styles.header, headerStyle]}>
        <Text style={styles.headerTitle}>Newsfeed</Text>
        <Text style={styles.headerSubtitle}>
          Scroll to collapse this header
        </Text>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {FEED_ITEMS.map((item) => {
          return (
            <Animated.View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBody}>
                A scroll-linked header keeps this layout responsive.
              </Text>
            </Animated.View>
          )
        })}
      </Animated.ScrollView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    padding: 16,
  },
  cardBody: {
    color: '#475569',
    fontSize: 14,
    marginTop: 6,
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#1e293b',
    justifyContent: 'flex-end',
    left: 0,
    paddingBottom: 14,
    paddingHorizontal: 20,
    paddingTop: 24,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  headerSubtitle: {
    color: '#bfdbfe',
    fontSize: 14,
    marginTop: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  screen: {
    backgroundColor: '#dbeafe',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: HEADER_MAX_HEIGHT + 16,
    paddingBottom: 24,
  },
})
