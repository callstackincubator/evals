import { useLoaderData } from 'expo-router'
import { Text } from 'react-native'

export async function loader() {
  return { greeting: 'Loaded on the route boundary' }
}

export default function Index() {
  const data = useLoaderData<typeof loader>()
  return <Text>{data.greeting}</Text>
}
