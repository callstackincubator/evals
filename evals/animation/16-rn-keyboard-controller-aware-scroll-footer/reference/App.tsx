import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import {
  KeyboardAwareScrollView,
  KeyboardProvider,
  useReanimatedKeyboardAnimation,
} from 'react-native-keyboard-controller'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets()

  const footerStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: bottomInset,
      transform: [{ translateY: -keyboard.height.value }],
    }
  })

  return (
    <View style={[styles.screen, { paddingTop: topInset }]}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        bottomOffset={bottomInset}
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
    padding: 16,
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
    paddingHorizontal: 16,
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
