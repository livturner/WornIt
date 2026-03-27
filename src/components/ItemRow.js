import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../constants/colors'
import { colorToHex } from '../utils/colorUtils'
import { typography } from '../constants/typography'

export default function ItemRow({ item }) {
  return (
    <View style={styles.itemRow}>
      <View style={[styles.colorDot, { backgroundColor: colorToHex(item.color) }]} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
      </View>
      <Text style={styles.wearCount}>×{item.wear_count}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBackground,
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
    color: colors.tertiaryText,
    fontSize: typography.sizes.xs,
    textTransform: 'capitalize',
  },
  wearCount: {
    color: colors.steelBlue,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
})
