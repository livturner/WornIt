import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../constants/colors'
import { typography } from '../constants/typography'

export default function WardrobeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wardrobe</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.oliveGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.ivory,
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.cormorantItalic,
  },
})