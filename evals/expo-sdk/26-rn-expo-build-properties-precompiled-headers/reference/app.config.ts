export default {
  expo: {
    name: 'build-properties-audit',
    slug: 'build-properties-audit',
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 36,
            targetSdkVersion: 36,
          },
          ios: {
            buildReactNativeFromSource: false,
            ccacheEnabled: true,
            forceStaticLinking: ['RNFBApp'],
            useFrameworks: 'static',
          },
        },
      ],
    ],
  },
}
