import { StyleSheet, Text, View } from 'react-native'
import {
  QueryClient,
  QueryClientProvider,
  QueryFunctionContext,
  useQuery,
} from '@tanstack/react-query'

type Profile = {
  firstName: string
  id: number
  lastName: string
}

type Project = {
  id: number
  title: string
}

type ProfileQueryKey = readonly ['profile', 'me']
type ProjectsQueryKey = readonly ['projects', number | 'pending']

const queryClient = new QueryClient()

async function fetchProfile(signal?: AbortSignal): Promise<Profile> {
  const response = await fetch('https://dummyjson.com/users/1', { signal })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const json = (await response.json()) as Profile
  return json
}

async function fetchProjectsByUserId(
  userId: number,
  signal?: AbortSignal
): Promise<Project[]> {
  const response = await fetch(`https://dummyjson.com/todos/user/${userId}`, {
    signal,
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const json = (await response.json()) as {
    todos: Array<{ id: number; todo: string }>
  }

  return json.todos.map((todo) => ({
    id: todo.id,
    title: todo.todo,
  }))
}

function ProjectsScreen() {
  const profileQuery = useQuery({
    queryFn: ({ signal }: QueryFunctionContext<ProfileQueryKey>) =>
      fetchProfile(signal),
    queryKey: ['profile', 'me'] as const,
  })

  const profileId = profileQuery.data?.id

  const projectsQuery = useQuery({
    enabled: !!profileId,
    queryFn: ({
      queryKey: [, userId],
      signal,
    }: QueryFunctionContext<ProjectsQueryKey>) => {
      if (typeof userId !== 'number') {
        return []
      }

      return fetchProjectsByUserId(userId, signal)
    },
    queryKey: ['projects', profileId ?? 'pending'] as const,
  })

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Profile & Projects</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile</Text>
        {profileQuery.isLoading ? <Text>Loading profile…</Text> : null}
        {profileQuery.data ? (
          <Text>{`${profileQuery.data.firstName} ${profileQuery.data.lastName}`}</Text>
        ) : null}
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
