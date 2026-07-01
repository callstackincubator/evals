import { Text } from 'react-native'

export default function Profile() {
  const name = process.env.PROFILE_NAME ?? 'Expo'

  return <Text>{name}</Text>
}
