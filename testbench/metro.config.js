import path from 'node:path'

import { getDefaultConfig } from '@expo/metro-config'

const config = getDefaultConfig(import.meta.dirname)

config.watchFolders.push(path.resolve(import.meta.dirname, '../evals'))

export default config
