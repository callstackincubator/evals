import { StatusBar } from 'expo-status-bar'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'

async function launchCameraPlaceholder() {
  // TODO: implement picker camera flow and error mapping for this eval
  return launchCamera({ mediaType: 'photo' })
}

async function launchLibraryPlaceholder() {
  // TODO: implement picker gallery flow for this eval
  return launchImageLibrary({ mediaType: 'photo' })
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>RN Image Picker Starter</Text>
      
      <Pressable style={styles.button} onPress={() => void launchCameraPlaceholder()}>
        <Text style={styles.buttonText}>Launch camera placeholder</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => void launchLibraryPlaceholder()}>
        <Text style={styles.buttonText}>Launch library placeholder</Text>
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
