import { useState } from 'react'
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../constants/colors'
import { typography } from '../constants/typography'

export default function ConfirmationScreen({ photo, items: initialItems, onSave, onRetake }) {
  const [items, setItems] = useState(initialItems)
  const [editingId, setEditingId] = useState(null)

  const confirmedCount = items.filter(item => item.confirmed).length
  const hasConfirmed = confirmedCount > 0

  // Toggle a single item confirmed/unconfirmed
  const toggleConfirm = (index) => {
    const updated = [...items]
    updated[index] = { ...updated[index], confirmed: !updated[index].confirmed }
    setItems(updated)
  }

  // Confirm all items at once
  const confirmAll = () => {
    setItems(items.map(item => ({ ...item, confirmed: true })))
  }

  // Rename an item
  const renameItem = (index, newName) => {
    const updated = [...items]
    updated[index] = { ...updated[index], name: newName }
    setItems(updated)
  }

  // Delete an item
  const deleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  // Add a missing item
  const addItem = () => {
    setItems([
      ...items,
      {
        name: '',
        category: 'tops',
        color: 'unknown',
        confirmed: false,
        isNew: true,
      },
    ])
    setEditingId(items.length)
  }

  const categoryColor = (category) => {
    switch (category) {
      case 'tops': return colors.steelBlue
      case 'bottoms': return colors.wineRed
      case 'outerwear': return '#5C7A5C'
      case 'shoes': return '#8B6914'
      case 'accessories': return '#7B5EA7'
      case 'dresses': return '#C4627A'
      default: return colors.espressoBark
    }
  }

  return (
    <View style={styles.container}>

      {/* Photo thumbnail */}
      <Image source={{ uri: photo }} style={styles.thumbnail} />

      {/* Header */}
      <View style={styles.header}>
        {items.length === 0 ? (
          <>
            <Text style={styles.title}>We couldn't identify any items</Text>
            <Text style={styles.subtitle}>Add them manually below</Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>We found {items.length} piece{items.length !== 1 ? 's' : ''}</Text>
            <Text style={styles.subtitle}>Confirm or edit before saving</Text>
          </>
        )}
      </View>

      {/* Confirm all button */}
      {items.length > 0 && confirmedCount < items.length && (
        <TouchableOpacity style={styles.confirmAllButton} onPress={confirmAll}>
          <Text style={styles.confirmAllText}>Confirm all</Text>
        </TouchableOpacity>
      )}

      {/* Item list */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {items.map((item, index) => (
          <View
            key={index}
            style={[styles.card, item.confirmed && styles.cardConfirmed]}
          >
            {/* Colour swatch */}
            <View style={[styles.swatch, { backgroundColor: item.color }]} />

            {/* Item details */}
            <View style={styles.cardContent}>
              {editingId === index ? (
                <TextInput
                  style={styles.nameInput}
                  value={item.name}
                  onChangeText={(text) => renameItem(index, text)}
                  onBlur={() => setEditingId(null)}
                  autoFocus
                  placeholder="Item name"
                  placeholderTextColor={colors.steelBlue}
                />
              ) : (
                <TouchableOpacity onPress={() => setEditingId(index)}>
                  <Text style={styles.itemName}>{item.name || 'Unnamed item'}</Text>
                </TouchableOpacity>
              )}
              <View style={[styles.categoryPill, { backgroundColor: categoryColor(item.category) }]}>
                <Text style={styles.categoryText}>
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => deleteItem(index)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={18} color={colors.wineRed} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleConfirm(index)}
                style={[styles.confirmButton, item.confirmed && styles.confirmButtonActive]}
              >
                <Ionicons
                  name={item.confirmed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={26}
                  color={item.confirmed ? colors.steelBlue : '#999'}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add missing item row */}
        <TouchableOpacity style={styles.addRow} onPress={addItem}>
          <Ionicons name="add-circle-outline" size={20} color={colors.steelBlue} />
          <Text style={styles.addText}>Add a missing piece</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom CTAs */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.retakeButton} onPress={onRetake}>
          <Text style={styles.retakeText}>Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, !hasConfirmed && styles.saveButtonDisabled]}
          onPress={() => hasConfirmed && onSave(items.filter(i => i.confirmed))}
          disabled={!hasConfirmed}
        >
          <Text style={styles.saveButtonText}>
            Save to wardrobe{hasConfirmed ? ` (${confirmedCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.espressoBark,
  },
  thumbnail: {
    width: '100%',
    height: '28%',
    resizeMode: 'cover',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  title: {
    color: colors.ivory,
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.cormorantItalic,
    marginBottom: 4,
  },
  subtitle: {
    color: '#999',
    fontSize: typography.sizes.sm,
  },
  confirmAllButton: {
    marginHorizontal: 24,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  confirmAllText: {
    color: colors.steelBlue,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A1A12',
    borderRadius: 12,
    marginBottom: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardConfirmed: {
    borderColor: colors.steelBlue,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    gap: 6,
  },
  itemName: {
    color: colors.ivory,
    fontSize: typography.sizes.md,
  },
  nameInput: {
    color: colors.ivory,
    fontSize: typography.sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.steelBlue,
    paddingBottom: 2,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  categoryText: {
    color: colors.ivory,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    padding: 4,
  },
  confirmButton: {
    padding: 4,
  },
  confirmButtonActive: {},
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  addText: {
    color: colors.steelBlue,
    fontSize: typography.sizes.sm,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A1A12',
  },
  retakeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.ivory,
    alignItems: 'center',
  },
  retakeText: {
    color: colors.ivory,
    fontSize: typography.sizes.md,
  },
  saveButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: colors.steelBlue,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#2A3A4A',
  },
  saveButtonText: {
    color: colors.ivory,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
})