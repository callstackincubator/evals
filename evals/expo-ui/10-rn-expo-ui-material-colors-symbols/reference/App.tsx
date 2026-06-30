import { Column, Host, Text as MaterialText, useMaterialColors } from '@expo/ui/jetpack-compose'

export default function App() {
  const colors = useMaterialColors()

  return (
    <Host style={{ flex: 1, backgroundColor: colors.surface }}>
      <Column>
        <MaterialText color={colors.onSurface}>Today</MaterialText>
        <Column style={{ backgroundColor: colors.primary }}>
          <MaterialText color={colors.onPrimary}>You have 3 tasks due</MaterialText>
        </Column>
      </Column>
    </Host>
  )
}
