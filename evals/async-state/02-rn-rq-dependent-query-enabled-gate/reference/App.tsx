import { StyleSheet, Text, View } from 'react-native'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'

type Profile = {
  id: string
  name: string
}

type Project = {
  id: string
  title: string
}

const queryClient = new QueryClient()

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function fetchProfile(): Promise<Profile> {
  await wait(200)
  return { id: 'user-42', name: 'Casey' }
}

async function fetchProjectsByUserId(userId: string): Promise<Project[]> {
  await wait(280)
  return [
    { id: `${userId}-p1`, title: 'Async-state rollout' },
    { id: `${userId}-p2`, title: 'RN performance audit' },
    { id: `${userId}-p3`, title: 'Offline reliability pass' },
  ]
}

function ProjectsScreen() {
  const profileQuery = useQuery({
    queryFn: fetchProfile,
    queryKey: ['profile', 'me'] as const,
  })

  const profileId = profileQuery.data?.id

  const projectsQuery = useQuery({
    enabled: Boolean(profileId),
    queryFn: ({ queryKey }) => {
      const [, userId] = queryKey as readonly ['projects', string]
      return fetchProjectsByUserId(userId)
    },
    queryKey: ['projects', profileId ?? 'pending'] as const,
  })

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Dependent Queries</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile</Text>
        {profileQuery.isLoading ? <Text>Loading profile…</Text> : null}
        {profileQuery.data ? <Text>{profileQuery.data.name}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Projects</Text>

        {!profileId ? (
          <Text style={styles.muted}>Waiting for profile id before fetching projects.</Text>
        ) : null}

        {projectsQuery.isLoading ? <Text>Loading projects…</Text> : null}

        {projectsQuery.data?.map((project) => {
          return (
            <Text key={project.id} style={styles.projectRow}>
              • {project.title}
            </Text>
          )
        })}
      </View>
    </View>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProjectsScreen />
    </QueryClientProvider>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  muted: {
    color: '#64748b',
  },
  projectRow: {
    color: '#334155',
    marginTop: 4,
  },
  screen: {
    backgroundColor: '#e2e8f0',
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 56,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
})
