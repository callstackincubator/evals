export async function getProfile() {
  return { name: process.env.PROFILE_NAME ?? 'Expo' }
}
