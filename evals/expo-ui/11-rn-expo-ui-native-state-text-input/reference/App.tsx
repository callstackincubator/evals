import { Host, Text, TextField, useNativeState } from '@expo/ui/jetpack-compose'

export default function App() {
  const query = useNativeState('')

  return (
    <Host style={{ flex: 1 }}>
      <Text>Search</Text>
      <TextField
        value={query.value}
        onValueChange={(next) => {
          query.value = next
        }}
      />
    </Host>
  )
}
