import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../constants/colors'

// variant="overlay" (default) — semi-transparent, for use over photos
// variant="solid" — card background, for use on solid backgrounds
export default function ItemTag({ name, variant = 'overlay' }) {
  return (
    <View style={[styles.tag, variant === 'solid' && styles.tagSolid]}>
      <Text style={styles.tagText}>{name.toUpperCase()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  tag: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tagSolid: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 0,
  },
  tagText: {
    color: colors.ivory,
    fontSize: 8,
    letterSpacing: 1,
  },
})
