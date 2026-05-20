import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import {
  KeyboardAwareScrollView,
  KeyboardProvider,
  useReanimatedKeyboardAnimation,
} from 'react-native-keyboard-controller'
import Animated, {
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated'

const FIELDS = [
  'First name',
  'Last name',
  'Email',
  'Company',
  'Role',
  'City',
  'Notes',
]

function FormScreen() {
  const keyboard = useReanimatedKeyboardAnimation()

  const footerStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: interpolate(keyboard.progress.value, [0, 1], [16, 8]),
      transform: [{ translateY: -keyboard.height.value }],
    }
  })

  return (
    <View style={styles.screen}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Checkout form</Text>
        {FIELDS.map((field) => {
          return (
            <View key={field} style={styles.fieldBlock}>
              <Text style={styles.label}>{field}</Text>
              <TextInput
                placeholder={field}
                placeholderTextColor="#64748b"
                style={styles.input}
              />
            </View>
          )
        })}
      </KeyboardAwareScrollView>

      <Animated.View style={[styles.footer, footerStyle]}>
        <Pressable style={styles.submitButton}>
          <Text style={styles.submitText}>Submit</Text>
        </Pressable>
      </Animated.View>
    </View>
  )
}

export default function App() {
  return (
    <KeyboardProvider>
      <FormScreen />
    </KeyboardProvider>
  )
}

const styles = StyleSheet.create({
  fieldBlock: {
    marginBottom: 14,
  },
  footer: {
    backgroundColor: '#fff',
    borderTopColor: '#cbd5e1',
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 14,
    position: 'absolute',
    right: 0,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#cbd5e1',
    borderRadius: 10,
    borderWidth: 1,
    color: '#0f172a',
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  label: {
    color: '#1e293b',
    fontSize: 13,
    marginBottom: 6,
  },
  screen: {
    backgroundColor: '#f8fafc',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 14,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
})
