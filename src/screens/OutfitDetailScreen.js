import { useState, useEffect } from 'react'
import {
  View, Text, Image, ScrollView,
  TouchableOpacity, StyleSheet, Alert
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../constants/colors'
import { colorToHex } from '../utils/colorUtils'
import { typography } from '../constants/typography'
import { fetchLogById, deleteLog } from '../services/wardrobeService'

export default function OutfitDetailScreen({ route, navigation }) {
  const { logId } = route.params
  const [log, setLog] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLog()
  }, [])

  const loadLog = async () => {
    try {
      const data = await fetchLogById(logId)
      setLog(data)
    } catch (error) {
      console.error('Error fetching log:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete outfit',
      'This will remove this log from your timeline. Your wardrobe items will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLog(logId)
              navigation.goBack()
            } catch (error) {
              console.error('Error deleting log:', error)
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

  const getItems = () => {
    return log?.log_items?.map(li => li.items).filter(Boolean) || []
  }

  if (isLoading || !log) {
    return <View style={styles.container} />
  }

  const items = getItems()

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Full bleed photo */}
        <View style={styles.photoContainer}>
          <Image source={{ uri: log.photo_url }} style={styles.photo} />

          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.ivory} />
          </TouchableOpacity>

          {/* Delete button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color={colors.ivory} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>

          {/* Date */}
          <Text style={styles.date}>{formatDate(log.logged_at)}</Text>

          {/* Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items</Text>
            {items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={[styles.colorDot, { backgroundColor: colorToHex(item.color) }]} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                </View>
                <Text style={styles.wearCount}>×{item.wear_count}</Text>
              </View>
            ))}
          </View>

          {/* Worn with */}
          {items.length > 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Worn together</Text>
              <View style={styles.tagRow}>
                {items.map((item, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{item.name.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
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
  backButton: {
    position: 'absolute',
    top: 56,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 56,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  date: {
    color: colors.ivory,
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.cormorantItalic,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#666',
    fontSize: typography.sizes.xs,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2318',
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: colors.ivory,
    fontSize: typography.sizes.md,
    marginBottom: 2,
  },
  itemCategory: {
    color: '#888',
    fontSize: typography.sizes.xs,
    textTransform: 'capitalize',
  },
  wearCount: {
    color: colors.steelBlue,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#1E2318',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  tagText: {
    color: colors.ivory,
    fontSize: 8,
    letterSpacing: 1,
  },
})