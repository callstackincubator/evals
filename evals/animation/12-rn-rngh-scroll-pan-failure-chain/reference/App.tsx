import { StyleSheet, Text, View } from 'react-native'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

const ROW_OPEN_OFFSET = -96

function clamp(value: number, min: number, max: number) {
  'worklet'

  return Math.min(max, Math.max(min, value))
}

const ITEMS = Array.from({ length: 16 }, (_, index) => `Feed row ${index + 1}`)

export default function App() {
  const rowTranslateX = useSharedValue(0)
  const dragStartX = useSharedValue(0)

  const nativeScroll = Gesture.Native()

  const rowPan = Gesture.Pan()
    .activeOffsetX([-14, 14])
    .failOffsetY([-10, 10])
    .simultaneousWithExternalGesture(nativeScroll)
    .onBegin(() => {
      dragStartX.value = rowTranslateX.value
    })
    .onUpdate((event) => {
      rowTranslateX.value = clamp(
        dragStartX.value + event.translationX,
        ROW_OPEN_OFFSET,
        0
      )
    })
    .onEnd(() => {
      const shouldOpen = rowTranslateX.value < ROW_OPEN_OFFSET / 2
      rowTranslateX.value = withSpring(shouldOpen ? ROW_OPEN_OFFSET : 0, {
        damping: 16,
        stiffness: 180,
      })
    })

  const rowAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: rowTranslateX.value }],
    }
  })

  return (
    <GestureHandlerRootView style={styles.root}>
      <Text style={styles.header}>
        Scroll vertically, swipe row 1 horizontally
      </Text>
      <GestureDetector gesture={nativeScroll}>
        <ScrollView contentContainerStyle={styles.content}>
          {ITEMS.map((item, index) => {
            if (index === 0) {
              return (
                <View key={item} style={styles.rowShell}>
                  <View style={styles.actionBackground}>
                    <Text style={styles.actionText}>Archive</Text>
                  </View>
                  <GestureDetector gesture={rowPan}>
                    <Animated.View style={[styles.row, rowAnimatedStyle]}>
                      <Text style={styles.rowText}>{item}</Text>
                      <Text style={styles.subText}>
                        Explicit axis thresholds + external scroll gesture
                      </Text>
                    </Animated.View>
                  </GestureDetector>
                </View>
              )
            }

            return (
              <View key={item} style={styles.row}>
                <Text style={styles.rowText}>{item}</Text>
              </View>
            )
          })}
        </ScrollView>
      </GestureDetector>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  actionBackground: {
    alignItems: 'flex-end',
    backgroundColor: '#dc2626',
    borderRadius: 14,
    bottom: 0,
    justifyContent: 'center',
    paddingRight: 18,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 120,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    gap: 10,
    paddingBottom: 24,
  },
  header: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  root: {
    backgroundColor: '#e0f2fe',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowShell: {
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  rowText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
  },
  subText: {
    color: '#475569',
    fontSize: 13,
    marginTop: 6,
  },
})
