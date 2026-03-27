import { useState, useEffect } from 'react'
import {
  View, Text, Image, ScrollView,
  StyleSheet, Alert
} from 'react-native'
import { colors } from '../constants/colors'
import { colorToHex } from '../utils/colorUtils'
import { typography } from '../constants/typography'
import { fetchItemById, deleteItem } from '../services/itemService'
import DetailHeader from '../components/DetailHeader'
import SectionTitle from '../components/SectionTitle'

export default function ItemDetailScreen({ route, navigation }) {
  const { itemId } = route.params
  const [item, setItem] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadItem()
  }, [])

  const loadItem = async () => {
    try {
      const data = await fetchItemById(itemId)
      setItem(data)
    } catch (error) {
      console.error('Error fetching item:', error)
      Alert.alert('Something went wrong', 'Failed to load this item.', [{ text: 'OK', onPress: () => navigation.goBack() }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete item',
      'This will remove this item from your wardrobe. Your outfit logs will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(itemId)
              navigation.goBack()
            } catch (error) {
              console.error('Error deleting item:', error)
              Alert.alert('Delete failed', 'Something went wrong removing this item. Please try again.')
            }
          }
        }
      ]
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getLogs = () => {
    return item?.log_items
      ?.map(li => li.logs)
      .filter(Boolean)
      .sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at)) || []
  }

  if (isLoading || !item) {
    return <View style={styles.container} />
  }

  const logs = getLogs()
  const coverPhoto = logs[0]?.photo_url || null

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Full bleed photo */}
        <View style={styles.photoContainer}>
          {coverPhoto ? (
            <Image source={{ uri: coverPhoto }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]} />
          )}

          <DetailHeader onBack={() => navigation.goBack()} onDelete={handleDelete} />
        </View>

        {/* Content */}
        <View style={styles.content}>

          {/* Item header */}
          <View style={styles.itemHeader}>
            <View style={[styles.colorDot, { backgroundColor: colorToHex(item.color) }]} />
            <View style={styles.itemMeta}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemCategory}>{item.category}</Text>
            </View>
            <Text style={styles.wearCount}>×{item.wear_count}</Text>
          </View>

          {/* Wear history */}
          {logs.length > 0 && (
            <View style={styles.section}>
              <SectionTitle label="Worn on" />
              {logs.map((log, index) => (
                <View key={log.id || index} style={styles.logRow}>
                  {log.photo_url ? (
                    <Image source={{ uri: log.photo_url }} style={styles.logThumb} />
                  ) : (
                    <View style={[styles.logThumb, styles.logThumbPlaceholder]} />
                  )}
                  <Text style={styles.logDate}>{formatDate(log.logged_at)}</Text>
                </View>
              ))}
            </View>
          )}

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
  photoContainer: {
    height: 480,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    backgroundColor: colors.cardBackground,
  },
  content: {
    padding: 20,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 14,
  },
  itemMeta: {
    flex: 1,
  },
  itemName: {
    color: colors.ivory,
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.cormorantItalic,
    marginBottom: 2,
  },
  itemCategory: {
    color: colors.tertiaryText,
    fontSize: typography.sizes.xs,
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
  wearCount: {
    color: colors.steelBlue,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  section: {
    marginBottom: 24,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBackground,
  },
  logThumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    marginRight: 14,
    resizeMode: 'cover',
  },
  logThumbPlaceholder: {
    backgroundColor: colors.cardBackground,
  },
  logDate: {
    color: colors.ivory,
    fontSize: typography.sizes.sm,
  },
})
