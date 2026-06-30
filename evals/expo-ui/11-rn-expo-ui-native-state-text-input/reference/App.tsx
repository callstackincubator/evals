import {
  Host,
  Text as ComposeText,
  TextField,
  useNativeState,
} from '@expo/ui/jetpack-compose'

export default function App() {
  const query = useNativeState('')

  return (
    <Host style={{ flex: 1 }}>
      <ComposeText>Search</ComposeText>
      <TextField
        value={query.value}
        onValueChange={(next) => {
          query.value = next
        }}
      />
    </Host>
  )
}
