import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../constants/colors'
import { typography } from '../constants/typography'

export default function EmptyState({ title, subtitle }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.oliveGreen,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    color: colors.ivory,
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.cormorantItalic,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.secondaryText,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
})
