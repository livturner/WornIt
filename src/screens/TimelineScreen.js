import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, 
  StyleSheet, RefreshControl, Alert
} from 'react-native'
import { Image } from 'expo-image'
import { useFocusEffect } from '@react-navigation/native'
import { colors } from '../constants/colors'
import { typography } from '../constants/typography'
import { fetchTimeline, fetchStreak } from '../services/logService'
import LoadingScreen from '../components/LoadingScreen'
import EmptyState from '../components/EmptyState'
import ItemTag from '../components/ItemTag'

export default function TimelineScreen({navigation}) {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeMonth, setActiveMonth] = useState('March')
  const [streak, setStreak] = useState(0)

  useFocusEffect(
    useCallback(() => {
      loadTimeline()
    }, [])
  )

  const loadTimeline = async () => {
    try {
      const [data, streakCount] = await Promise.all([fetchTimeline(), fetchStreak()])
      setLogs(data)
      setStreak(streakCount)
    } catch (error) {
      console.error('Timeline error:', error)
      Alert.alert('Something went wrong', 'Failed to load your timeline. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      const data = await fetchTimeline()
      setLogs(data)
    } catch (error) {
      console.error('Timeline error:', error)
      Alert.alert('Something went wrong', 'Failed to refresh your timeline. Please try again.')
    } finally {
      setRefreshing(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    })
  }

  const formatShortDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    })
  }

  const getItems = (log) => {
    return log.log_items?.map(li => li.items).filter(Boolean) || []
  }

  if (isLoading) return <LoadingScreen />

  if (logs.length === 0) {
    return (
      <EmptyState
        title="No fits logged yet"
        subtitle="Head to the camera tab to log your first outfit"
      />
    )
  }

  const hero = logs[0]
  const rest = logs.slice(1)
  const heroItems = getItems(hero)

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fits</Text>
        <View style={styles.headerRight}>
          {streak > 0 && (
            <Text style={styles.streakInline}>🔥 {streak}</Text>
          )}
          <TouchableOpacity>
            <Text style={styles.monthFilter}>{activeMonth} ↓</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ivory} />}
      >

        {/* Hero card */}
        <TouchableOpacity style={styles.heroCard} activeOpacity={0.9} onPress={() => navigation.navigate('OutfitDetail', { logId: hero.id, photoUrl: hero.photo_url })}>
          <Image source={{ uri: hero.photo_url }} style={styles.heroImage} contentFit="cover" cachePolicy="memory-disk" priority="high" transition={200} />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroDate}>{formatDate(hero.logged_at)}</Text>
            <View style={styles.tagRow}>
              {heroItems.slice(0, 3).map((item, i) => (
                <ItemTag key={i} name={item.name} />
              ))}
            </View>
          </View>
        </TouchableOpacity>

        {/* Grid of smaller cards */}
        <View style={styles.grid}>
          {rest.map((log, index) => {
            const items = getItems(log)
            return (
              <TouchableOpacity
                key={log.id}
                style={styles.gridCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('OutfitDetail', { logId: log.id, photoUrl: log.photo_url })}
              >
                <Image source={{ uri: log.photo_url }} style={styles.gridImage} contentFit="cover" cachePolicy="memory-disk" transition={200} />
                <View style={styles.gridOverlay} />
                <View style={styles.gridContent}>
                  <Text style={styles.gridDate}>{formatShortDate(log.logged_at)}</Text>
                  <View style={styles.tagRow}>
                    {items.slice(0, 2).map((item, i) => (
                      <ItemTag key={i} name={item.name} />
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.oliveGreen,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: {
    color: colors.ivory,
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fonts.cormorantItalic,
    letterSpacing: -0.5,
  },
  monthFilter: {
    color: colors.steelBlue,
    fontSize: typography.sizes.sm,
    letterSpacing: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    gap: 4,
  },
  heroCard: {
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  heroDate: {
    color: colors.ivory,
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.cormorantItalic,
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  gridCard: {
    width: '49.5%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridContent: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  gridDate: {
    color: colors.ivory,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.cormorantItalic,
    marginBottom: 4,
    opacity: 0.9,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakInline: {
    color: colors.ivory,
    fontSize: typography.sizes.sm,
  },
})
