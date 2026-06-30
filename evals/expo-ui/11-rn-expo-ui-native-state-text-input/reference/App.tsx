import { Host, Text as UIText, TextInput, useNativeState } from '@expo/ui'
import { useEffect, useState } from 'react'

export default function App() {
  const query = useNativeState('')
  const [preview, setPreview] = useState('')

  useEffect(() => {
    query.onChange = (value: string) => {
      setPreview(value)
    }
    return () => {
      query.onChange = null
    }
  }, [query])

  return (
    <Host style={{ flex: 1 }}>
      <UIText>Search</UIText>
      <TextInput
        value={query}
        onChangeText={(next) => {
          query.value = next
        }}
        placeholder="Type to filter"
        autoCapitalize="none"
      />
      <UIText>{preview ? `Searching for "${preview}"` : 'Start typing above'}</UIText>
    </Host>
  )
}
