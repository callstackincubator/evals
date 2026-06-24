import { useLoaderData } from 'expo-router'
import { Text } from 'react-native'
import { readProfile } from './server/profile.server'

export async function loader() {
  return readProfile()
}

export default function Profile() {
  const profile = useLoaderData<typeof loader>()
  return <Text>{profile.name}</Text>
}
