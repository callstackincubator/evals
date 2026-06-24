export async function readProfile() {
  return { name: process.env.PROFILE_NAME ?? 'Expo' }
}
