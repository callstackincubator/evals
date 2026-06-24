import { Link, Unmatched } from 'expo-router'
import { Text, View } from 'react-native'

export default function NotFound() {
  return <View><Unmatched /><Text>Missing route</Text><Link href="/">Go home</Link></View>
}
