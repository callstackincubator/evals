import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'

export default [
  {
    ignores: [
      'results/**/*',
      'runs/**/*',
      'runner/solver/template/**/*',
      '**/node_modules',
      '**/lib',
      '**/build',
      '**/dist',
      'evals/**',
    ],
  },
  eslintPluginPrettierRecommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['**/babel.config.js', '**/react-native.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    rules: {
      'prettier/prettier': 'error',
    },
  },
]
