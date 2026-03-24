import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, Image,
  TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl
} from 'react-native'
import {useFocusEffect} from '@react-navigation/native'
import { colors } from '../constants/colors'
import { typography } from '../constants/typography'
import { fetchWardrobe } from '../services/itemService'

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories', 'Outerwear']

export default function WardrobeScreen({ navigation }) {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')

  useFocusEffect(
    useCallback(() => {
      loadWardrobe()
    }, [])
  )

  const loadWardrobe = async () => {
    try {
      const data = await fetchWardrobe()
      setItems(data)
    } catch (error) {
      console.error('Wardrobe error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      const data = await fetchWardrobe()
      setItems(data)
    } catch (error) {
      console.error('Wardrobe error:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase())

  const totalWears = items.reduce((sum, item) => sum + item.wear_count, 0)

  const getPhotoUrl = (item) => {
    return item.log_items?.[0]?.logs?.photo_url || null
  }

  const isUnworn = (item) => {
    if (!item.first_worn_at) return false
    const daysSince = (Date.now() - new Date(item.first_worn_at)) / (1000 * 60 * 60 * 24)
    return daysSince > 30 && item.wear_count < 2
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.ivory} />
      </View>
    )
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Your wardrobe is empty</Text>
        <Text style={styles.emptySubtitle}>Your wardrobe builds itself. Log your first outfit to get started.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Wardrobe</Text>
          <Text style={styles.itemCount}>{items.length} pieces</Text>
        </View>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabContent}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={styles.tab}
          >
            <Text style={[styles.tabText, activeCategory === cat && styles.tabTextActive]}>
              {cat}
            </Text>
            {activeCategory === cat && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{filteredItems.length}</Text>
          <Text style={styles.statLabel}>pieces</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{totalWears}</Text>
          <Text style={styles.statLabel}>total wears</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            {items.length > 0 ? (totalWears / items.length).toFixed(1) : 0}
          </Text>
          <Text style={styles.statLabel}>avg wears</Text>
        </View>
      </View>

      {/* Grid */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ivory} />}
      >
        {filteredItems.length === 0 ? (
          <View style={styles.emptyCategory}>
            <Text style={styles.emptyCategoryText}>No {activeCategory.toLowerCase()} logged yet</Text>
          </View>
        ) : filteredItems.map((item, index) => {
          const photoUrl = getPhotoUrl(item)
          const unworn = isUnworn(item)

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                index % 3 === 0 && styles.cardTall,
              ]}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
            >
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.cardImage} />
              ) : (
                <View style={styles.cardPlaceholder} />
              )}

              <View style={styles.cardOverlay} />

              {/* Wear count badge */}
              <View style={styles.wearBadge}>
                <Text style={styles.wearBadgeText}>×{item.wear_count}</Text>
              </View>

              {/* Unworn badge */}
              {unworn && (
                <View style={styles.unwornBadge}>
                  <Text style={styles.unwornBadgeText}>unworn</Text>
                </View>
              )}

              {/* Item name */}
              <View style={styles.cardContent}>
                <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
              </View>

            </TouchableOpacity>
          )
        })}
      </ScrollView>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.oliveGreen,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.oliveGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.oliveGreen,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    color: colors.ivory,
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.cormorantItalic,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#666',
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    color: colors.ivory,
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fonts.cormorantItalic,
    letterSpacing: -0.5,
  },
  itemCount: {
    color: '#666',
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  tabScroll: {
    flexGrow: 0,
  },
  tabContent: {
    paddingHorizontal: 16,
    gap: 24,
  },
  tab: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabText: {
    color: '#666',
    fontSize: typography.sizes.sm,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: colors.ivory,
  },
  tabUnderline: {
    height: 1.5,
    backgroundColor: colors.steelBlue,
    width: '100%',
    marginTop: 4,
  },
  statsStrip: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1E2318',
    marginTop: 8,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: colors.ivory,
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.cormorantItalic,
  },
  statLabel: {
    color: '#666',
    fontSize: typography.sizes.xs,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1E2318',
  },
  scroll: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    padding: 3,
    paddingBottom: 20,
  },
  card: {
    width: '49.6%',
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1E2318',
  },
  cardTall: {
    height: 240,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1E2318',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  wearBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(70,130,180,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  wearBadgeText: {
    color: colors.ivory,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  unwornBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(88,24,31,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  unwornBadgeText: {
    color: colors.ivory,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  cardContent: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
  },
  cardName: {
    color: colors.ivory,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  emptyCategory: {
  flex: 1,
  alignItems: 'center',
  paddingTop: 60,
},
emptyCategoryText: {
  color: '#666',
  fontSize: typography.sizes.md,
  fontFamily: typography.fonts.cormorantItalic,
},
})