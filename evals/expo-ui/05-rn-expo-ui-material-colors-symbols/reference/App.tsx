import { Column, Host, Text, useMaterialColors } from '@expo/ui/jetpack-compose'

export default function App() {
  const colors = useMaterialColors()

  return (
    <Host style={{ flex: 1, backgroundColor: colors.surface }}>
      <Column>
        <Text color={colors.onSurface}>Today</Text>
        <Column style={{ backgroundColor: colors.primary }}>
          <Text color={colors.onPrimary}>You have 3 tasks due</Text>
        </Column>
      </Column>
    </Host>
  )
}
