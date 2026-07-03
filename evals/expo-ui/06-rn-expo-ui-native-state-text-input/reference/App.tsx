import {
  Column,
  Host,
  Text,
  TextField,
  useNativeState,
} from '@expo/ui/jetpack-compose'

export default function App() {
  const query = useNativeState('')

  return (
    <Host style={{ flex: 1 }}>
      <Column>
        <Text>Search</Text>
        <TextField value={query} />
      </Column>
    </Host>
  )
}
