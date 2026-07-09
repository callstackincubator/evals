import { useLoaderData } from 'expo-router'
import { Text } from 'react-native'

export async function loader() {
  return { name: process.env.PROFILE_NAME ?? 'Expo' }
}

export default function Profile() {
  const profile = useLoaderData<typeof loader>()
  return <Text>{profile.name}</Text>
}
