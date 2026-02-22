import { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

const SHEET_HEIGHT = 320
const CLOSE_THRESHOLD = 140

export default function App() {
  const [visible, setVisible] = useState(false)
  const translateY = useSharedValue(SHEET_HEIGHT)

  function handleOnShow() {
    translateY.value = withTiming(0, { duration: 160 })
  }

  function handleOnClose() {
    'worklet'
    translateY.value = withTiming(
      SHEET_HEIGHT,
      { duration: 160 },
      (finished) => {
        if (finished) {
          scheduleOnRN(setVisible, false)
        }
      }
    )
  }

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY)
    })
    .onEnd(() => {
      if (translateY.value > CLOSE_THRESHOLD) {
        handleOnClose()
        return
      }

      translateY.value = withSpring(0, { damping: 16, stiffness: 180 })
    })

  const sheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    }
  })

  return (
    <GestureHandlerRootView style={styles.screen}>
      <Pressable onPress={() => setVisible(true)} style={styles.openButton}>
        <Text style={styles.openButtonText}>Open gesture modal</Text>
      </Pressable>

      <Modal
        animationType="fade"
        onShow={handleOnShow}
        onRequestClose={handleOnClose}
        transparent
        visible={visible}
      >
        <GestureHandlerRootView style={styles.modalRoot}>
          <Pressable onPress={handleOnClose} style={styles.backdrop} />
          <GestureDetector gesture={pan}>
            <Animated.View style={[styles.sheet, sheetStyle]}>
              <View style={styles.grabber} />
              <Text style={styles.title}>Drag down to dismiss</Text>
              <Text style={styles.subtitle}>
                This modal path is wrapped in GestureHandlerRootView for Android
                gesture safety.
              </Text>
            </Animated.View>
          </GestureDetector>
        </GestureHandlerRootView>
      </Modal>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(15,23,42,0.42)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  grabber: {
    alignSelf: 'center',
    backgroundColor: '#cbd5e1',
    borderRadius: 3,
    height: 6,
    marginBottom: 14,
    width: 58,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  openButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  openButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    flex: 1,
    justifyContent: 'center',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    minHeight: SHEET_HEIGHT,
    padding: 18,
  },
  subtitle: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  title: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
  },
})
