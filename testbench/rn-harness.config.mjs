import { chromium, webPlatform } from '@react-native-harness/platform-web'

const config = {
  entryPoint: './app/index.ts',
  appRegistryComponentName: 'main',
  runners: [
    webPlatform({
      name: 'web',
      browser: chromium('http://localhost:8081'),
    }),
  ],
  defaultRunner: 'web',
}

export default config
