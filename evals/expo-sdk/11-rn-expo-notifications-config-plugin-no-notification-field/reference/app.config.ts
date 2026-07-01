export default {
  expo: {
    name: 'notification-config-audit',
    slug: 'notification-config-audit',
    plugins: [
      [
        'expo-notifications',
        {
          color: '#111827',
          defaultChannel: 'default',
          enableBackgroundRemoteNotifications: true,
          icon: './assets/notification.png',
        },
      ],
    ],
  },
}
