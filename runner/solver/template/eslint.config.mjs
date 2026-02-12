import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'no-var': 'warn',
      'prefer-const': 'warn',
      'eqeqeq': ['warn', 'always'],
      'curly': ['warn', 'all'],
      'default-case-last': 'warn',
      'no-fallthrough': 'warn',
      'no-unreachable': 'warn',
      'no-unreachable-loop': 'warn',
      'no-constant-condition': ['warn', { checkLoops: false }],
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'no-unused-private-class-members': 'warn',
      'no-implicit-coercion': 'warn',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-shadow': 'warn',
      'no-redeclare': 'warn',
      'no-empty-function': 'warn',
      'no-array-constructor': 'warn',
      'no-unsafe-optional-chaining': 'warn',
    },
  },
]
