/**
 * Renders the workspace App and passes. Render time is taken from Jest's
 * test duration in the JSON report (runner parses it as renderTimeMs).
 */
import React from 'react'
import { describe, it, expect, render } from 'react-native-harness'
import App from '../app/App'

describe('Evals testbench', () => {
  it('renders the app and measures mount time', async () => {
    await render(<App />, { timeout: 5000 })
    expect(true).toBe(true)
  })
})
