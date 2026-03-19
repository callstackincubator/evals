import React from 'react'
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native'

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Overview</Text>
      <ImageBackground
        source={require('banner.png')}
        style={styles.header}
        resizeMode='cover'
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Dock overview</Text>
          <Text style={styles.headerSubtitle}>Morning coordination</Text>
        </View>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flex: 1,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  headerImage: {
    borderRadius: 20,
  },
  headerSubtitle: {
    color: '#fff',
    marginTop: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
})
