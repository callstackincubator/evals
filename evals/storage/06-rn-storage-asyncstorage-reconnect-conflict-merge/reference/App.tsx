import AsyncStorage from '@react-native-async-storage/async-storage'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type Entity = {
  body: string
  id: string
  updatedAt: number
  version: number
}

type ConflictMarker = {
  fields: string[]
  id: string
  localVersion: number
  remoteVersion: number
  resolved: boolean
}

const MERGED_ENTITIES_KEY = 'sync:entities:merged'
const CONFLICT_MARKERS_KEY = 'sync:entities:conflicts'

function mergeBody(local: Entity, remote: Entity) {
  if (local.body === remote.body) {
    return local.body
  }
  if (local.updatedAt >= remote.updatedAt) {
    return local.body
  }
  return remote.body
}

function mergeEntity(local: Entity, remote: Entity) {
  const conflicts: string[] = []

  const body = mergeBody(local, remote)

  if (local.body !== remote.body) {
    conflicts.push('body')
  }

  const merged: Entity = {
    body,
    id: local.id,
    updatedAt: Math.max(local.updatedAt, remote.updatedAt),
    version: Math.max(local.version, remote.version) + 1,
  }

  const marker: ConflictMarker = {
    fields: conflicts,
    id: local.id,
    localVersion: local.version,
    remoteVersion: remote.version,
    resolved: conflicts.length === 0,
  }

  return { marker, merged }
}

function reconcile(localEntities: Entity[], remoteEntities: Entity[]) {
  const localMap = new Map(localEntities.map((entity) => [entity.id, entity]))
  const remoteMap = new Map(remoteEntities.map((entity) => [entity.id, entity]))

  const ids = Array.from(
    new Set([...localMap.keys(), ...remoteMap.keys()])
  ).sort()

  const merged: Entity[] = []
  const markers: ConflictMarker[] = []

  for (const id of ids) {
    const local = localMap.get(id)
    const remote = remoteMap.get(id)

    if (local && remote) {
      const result = mergeEntity(local, remote)
      merged.push(result.merged)
      markers.push(result.marker)
      continue
    }

    if (local) {
      merged.push(local)
      markers.push({
        fields: [],
        id,
        localVersion: local.version,
        remoteVersion: local.version,
        resolved: true,
      })
      continue
    }

    if (remote) {
      merged.push(remote)
      markers.push({
        fields: [],
        id,
        localVersion: remote.version,
        remoteVersion: remote.version,
        resolved: true,
      })
    }
  }

  return { markers, merged }
}

export default function App() {
  const [status, setStatus] = useState('idle')
  const [lastConflictCount, setLastConflictCount] = useState(0)

  const runReconnectSync = async () => {
    setStatus('reconciling')

    const localEntities: Entity[] = [
      { body: 'Local note', id: 'a', updatedAt: 300, version: 3 },
      { body: 'Only local', id: 'b', updatedAt: 310, version: 1 },
    ]

    const remoteEntities: Entity[] = [
      { body: 'Remote note', id: 'a', updatedAt: 280, version: 4 },
      { body: 'Only remote', id: 'c', updatedAt: 100, version: 1 },
    ]

    const { markers, merged } = reconcile(localEntities, remoteEntities)

    await AsyncStorage.multiSet([
      [MERGED_ENTITIES_KEY, JSON.stringify(merged)],
      [CONFLICT_MARKERS_KEY, JSON.stringify(markers)],
    ])

    const conflictedMarkers = markers.filter(({ resolved }) => !resolved)
    setLastConflictCount(conflictedMarkers.length)
    setStatus('done')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reconnect Reconcile</Text>
      <Text style={styles.row}>Status: {status}</Text>
      <Text style={styles.row}>Unresolved conflicts: {lastConflictCount}</Text>
      <Pressable style={styles.button} onPress={runReconnectSync}>
        <Text style={styles.buttonText}>Run Merge Policy</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1f4fd1',
    borderRadius: 10,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#f4f6fb',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  row: {
    color: '#222a3f',
    marginTop: 6,
  },
  title: {
    color: '#111728',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
})
