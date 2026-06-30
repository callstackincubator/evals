import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'

async function fetchGreeting() {
  return { greeting: 'Loaded on the route boundary' }
}

export default function Index() {
  const [data, setData] = useState<{ greeting: string } | null>(null)

  useEffect(() => {
    fetchGreeting().then(setData)
  }, [])

  return (
    <View>
      <Text>{data?.greeting ?? 'Loading...'}</Text>
    </View>
  )
}
