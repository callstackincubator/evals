import { useLoaderData } from 'expo-router'
import { Text } from 'react-native'
import { getProfile } from '../lib/profile.server'

export async function loader() {
  return getProfile()
}

export default function Profile() {
  const profile = useLoaderData<typeof loader>()
  return <Text>{profile.name}</Text>
}
