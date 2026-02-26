import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

const COLLAPSED_HEIGHT = 88
const EXPANDED_HEIGHT = 220

export default function App() {
  const progress = useSharedValue(0)

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        progress.value,
        [0, 1],
        [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
        Extrapolation.CLAMP
      ),
    }
  })

  const detailsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(
            progress.value,
            [0, 1],
            [8, 0],
            Extrapolation.CLAMP
          ),
        },
      ],
    }
  })

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.card, cardAnimatedStyle]}>
        <Pressable
          onPress={() => {
            const next = progress.value === 0 ? 1 : 0
            progress.value = withSpring(next)
          }}
          style={styles.header}
        >
          <Text style={styles.title}>Shipment details</Text>

        </Pressable>

        <Animated.View style={[styles.details, detailsAnimatedStyle]}>
          <Text style={styles.copy}>
            Estimated arrival: Tomorrow, 10:00 - 12:00
          </Text>
          <Text style={styles.copy}>Carrier: Eastline Express</Text>
          <Text style={styles.copy}>Tracking: EX-329-1192</Text>
        </Animated.View>
      </Animated.View>
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
