import { Button, Column, Host, Row, Switch, Text } from '@expo/ui'
import { useState } from 'react'

export default function App() {
  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(false)

  const handleReset = () => {
    setPushEnabled(true)
    setEmailEnabled(false)
  }

  return (
    <Host style={{ flex: 1 }}>
      <Column>
        <Text>Notifications</Text>

        <Row>
          <Text>Push notifications</Text>
          <Switch value={pushEnabled} onValueChange={setPushEnabled} />
        </Row>

        <Row>
          <Text>Email updates</Text>
          <Switch value={emailEnabled} onValueChange={setEmailEnabled} />
        </Row>

        <Button label="Reset to defaults" onPress={handleReset} />
      </Column>
    </Host>
  )
}
