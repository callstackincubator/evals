import { Column, Host, Row, Switch, Text as UIText } from '@expo/ui'
import { useState } from 'react'

export default function App() {
  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(false)

  return (
    <Host style={{ flex: 1 }}>
      <Column>
        <UIText>Notifications</UIText>

        <Row>
          <UIText>Push notifications</UIText>
          <Switch value={pushEnabled} onValueChange={setPushEnabled} />
        </Row>

        <Row>
          <UIText>Email updates</UIText>
          <Switch value={emailEnabled} onValueChange={setEmailEnabled} />
        </Row>
      </Column>
    </Host>
  )
}
