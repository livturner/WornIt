import { useState } from 'react'
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../constants/colors'
import { colorToHex } from '../utils/colorUtils'
import { typography } from '../constants/typography'

const COLORS = ['red', 'navy', 'blue', 'white', 'black', 'grey', 'brown', 'cream', 'beige', 'green', 'pink', 'yellow', 'orange', 'purple', 'burgundy', 'tan', 'camel', 'ivory', 'khaki', 'denim']

export default function ConfirmationScreen({ photo, items: initialItems, onSave, onRetake }) {
  const [items, setItems] = useState(initialItems)
  const [editingId, setEditingId] = useState(null)
  const [colorPickerIndex, setColorPickerIndex] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const confirmedCount = items.filter(item => item.confirmed).length
  const hasConfirmed = confirmedCount > 0

  const toggleConfirm = (index) => {
    const updated = [...items]
    updated[index] = { ...updated[index], confirmed: !updated[index].confirmed }
    setItems(updated)
  }

  const confirmAll = () => {
    setItems(items.map(item => ({ ...item, confirmed: true })))
  }

  const renameItem = (index, newName) => {
    const updated = [...items]
    updated[index] = { ...updated[index], name: newName }
    setItems(updated)
  }

  const recolorItem = (index, color) => {
    const updated = [...items]
    updated[index] = { ...updated[index], color: color }
    setItems(updated)
  }

  const deleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const addItem = () => {
    setItems([
      ...items,
      { name: '', category: 'tops', color: 'unknown', confirmed: false, isNew: true },
    ])
    setEditingId(items.length)
  }

  const categoryColor = (category) => {
    switch (category) {
      case 'tops': return colors.steelBlue
      case 'bottoms': return '#8B6914'
      case 'outerwear': return '#5C7A5C'
      case 'shoes': return '#8B6914'
      case 'accessories': return '#7B5EA7'
      case 'dresses': return '#C4627A'
      default: return colors.oliveGreen
    }
  }

  return (
    <View style={styles.container}>

      <Image source={{ uri: photo }} style={styles.thumbnail} />

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

      {items.length > 0 && confirmedCount < items.length && (
        <TouchableOpacity style={styles.confirmAllButton} onPress={confirmAll}>
          <Text style={styles.confirmAllText}>Confirm all</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {items.map((item, index) => (
          <View key={index} style={[styles.card, item.confirmed && styles.cardConfirmed]}>

            {/* Colour swatch — tap to open color picker */}
            <TouchableOpacity
              onPress={() => setColorPickerIndex(index)}
              style={[styles.swatch, { backgroundColor: colorToHex(item.color) }]}
            />

            <View style={styles.cardContent}>
              {editingId === index ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={styles.nameInput}
                    value={item.name}
                    onChangeText={(text) => renameItem(index, text)}
                    onBlur={() => setEditingId(null)}
                    autoFocus
                    placeholder="Item name"
                    placeholderTextColor={colors.steelBlue}
                  />
                  <TouchableOpacity onPress={() => setEditingId(null)} style={styles.doneButton}>
                    <Text style={styles.doneText}>Done</Text>
                  </TouchableOpacity>
                </View>
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

            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => deleteItem(index)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={18} color={colors.ivory} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleConfirm(index)}
                style={[styles.confirmButton, item.confirmed && styles.confirmButtonActive]}
              >
                <Ionicons
                  name={item.confirmed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={26}
                  color={item.confirmed ? colors.steelBlue : colors.mutedText}
                />
              </TouchableOpacity>
            </View>

          </View>
        ))}

        <TouchableOpacity style={styles.addRow} onPress={addItem}>
          <Ionicons name="add-circle-outline" size={20} color={colors.steelBlue} />
          <Text style={styles.addText}>Add a missing piece</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.retakeButton} onPress={onRetake}>
          <Text style={styles.retakeText}>Retake</Text>
        </TouchableOpacity>
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            (!hasConfirmed || isSaving) && styles.saveButtonDisabled,
            pressed && hasConfirmed && !isSaving && { opacity: 0.8, transform: [{ scale: 0.98 }] },
          ]}
          onPress={async () => {
            if (!hasConfirmed || isSaving) return
            setIsSaving(true)
            await onSave(items.filter(i => i.confirmed))
          }}
          disabled={!hasConfirmed || isSaving}
        >
          <Text style={styles.saveButtonText}>
            Save to wardrobe{hasConfirmed ? ` (${confirmedCount})` : ''}
          </Text>
        </Pressable>
      </View>

      {/* Color picker modal */}
      <Modal
        visible={colorPickerIndex !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setColorPickerIndex(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => setColorPickerIndex(null)}
          activeOpacity={1}
        />
        <View style={styles.colorSheet}>
          <Text style={styles.colorSheetTitle}>Choose a colour</Text>
          <View style={styles.colorGrid}>
            {COLORS.map(color => (
              <TouchableOpacity
                key={color}
                onPress={() => {
                  recolorItem(colorPickerIndex, color)
                  setColorPickerIndex(null)
                }}
                style={[
                  styles.colorSheetSwatch,
                  { backgroundColor: colorToHex(color) },
                  colorPickerIndex !== null && items[colorPickerIndex]?.color === color && styles.colorSwatchSelected,
                ]}
              />
            ))}
          </View>
        </View>
      </Modal>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.oliveGreen,
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
    color: colors.mutedText,
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
    flexGrow: 0,
    maxHeight: '45%',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
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
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    flex: 1,
    color: colors.ivory,
    fontSize: typography.sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.steelBlue,
    paddingBottom: 2,
  },
  doneButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  doneText: {
    color: colors.steelBlue,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  itemName: {
    color: colors.ivory,
    fontSize: typography.sizes.md,
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
    borderTopColor: colors.cardBackground,
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
    backgroundColor: '#2a2e25',
    borderWidth: 1,
    borderColor: '#444',
  },
  saveButtonText: {
    color: colors.ivory,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  colorSheet: {
    backgroundColor: colors.cardBackground,
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  colorSheetTitle: {
    color: colors.ivory,
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.cormorantItalic,
    marginBottom: 16,
    textAlign: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  colorSheetSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  colorSwatchSelected: {
    borderColor: colors.ivory,
    borderWidth: 2,
  },
})