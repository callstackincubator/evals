export default {
  expo: {
    name: 'build-properties-audit',
    slug: 'build-properties-audit',
    plugins: [
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
          },
        },
      ],
    ],
  },
}
