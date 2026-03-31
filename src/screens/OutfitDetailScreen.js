import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView,
  StyleSheet, Alert
} from 'react-native'
import { Image } from 'expo-image'
import { colors } from '../constants/colors'
import { typography } from '../constants/typography'
import { fetchLogById, deleteLog } from '../services/logService'
import DetailHeader from '../components/DetailHeader'
import SectionTitle from '../components/SectionTitle'
import ItemRow from '../components/ItemRow'
import ItemTag from '../components/ItemTag'

export default function OutfitDetailScreen({ route, navigation }) {
  const { logId, photoUrl: initialPhotoUrl } = route.params
  const [log, setLog] = useState(null)

  useEffect(() => {
    loadLog()
  }, [])

  const loadLog = async () => {
    try {
      const data = await fetchLogById(logId)
      setLog(data)
    } catch (error) {
      console.error('Error fetching log:', error)
      Alert.alert('Something went wrong', 'Failed to load this outfit.', [{ text: 'OK', onPress: () => navigation.goBack() }])
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
              Alert.alert('Delete failed', 'Something went wrong removing this outfit. Please try again.')
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

  const photoUri = log?.photo_url || initialPhotoUrl
  const items = getItems()

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Full bleed photo */}
        <View style={styles.photoContainer}>
          <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" cachePolicy="memory-disk" priority="high" transition={200} />

          <DetailHeader onBack={() => navigation.goBack()} onDelete={handleDelete} />
        </View>

        {/* Content */}
        {log && (
          <View style={styles.content}>

            {/* Date */}
            <Text style={styles.date}>{formatDate(log.logged_at)}</Text>

            {/* Items */}
            <View style={styles.section}>
              <SectionTitle label="Items" />
              {items.map((item, index) => (
                <ItemRow key={index} item={item} />
              ))}
            </View>

            {/* Worn with */}
            {items.length > 1 && (
              <View style={styles.section}>
                <SectionTitle label="Worn together" />
                <View style={styles.tagRow}>
                  {items.map((item, index) => (
                    <ItemTag key={index} name={item.name} variant="solid" />
                  ))}
                </View>
              </View>
            )}

          </View>
        )}
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
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
})