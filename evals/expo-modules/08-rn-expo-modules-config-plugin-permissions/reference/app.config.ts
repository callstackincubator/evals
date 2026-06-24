export default {
  expo: {
    plugins: [
      ['./plugin/withAuditPermissions', { microphoneMessage: 'Allow audio audit recording.' }],
    ],
  },
}
