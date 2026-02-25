import * as ImagePicker from 'expo-image-picker'
import { StatusBar } from 'expo-status-bar'
import { Pressable, StyleSheet, Text, View } from 'react-native'

async function requestMediaPermissionPlaceholder() {
  // TODO: implement media permission handling for this eval
  return ImagePicker.requestMediaLibraryPermissionsAsync()
}

async function launchPickerPlaceholder() {
  // TODO: implement camera/gallery fallback handling for this eval
  return ImagePicker.launchImageLibraryAsync()
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Expo Image Picker Starter</Text>
      <Pressable style={styles.button} onPress={() => void requestMediaPermissionPlaceholder()}>
        <Text style={styles.buttonText}>Call permission placeholder</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => void launchPickerPlaceholder()}>
        <Text style={styles.buttonText}>Call picker placeholder</Text>
      </Pressable>
      <StatusBar style='auto' />
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    rowGap: 10,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
  },
})
