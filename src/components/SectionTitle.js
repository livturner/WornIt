import { Text, StyleSheet } from 'react-native'
import { colors } from '../constants/colors'
import { typography } from '../constants/typography'

export default function SectionTitle({ label }) {
  return <Text style={styles.title}>{label}</Text>
}

const styles = StyleSheet.create({
  title: {
    color: colors.secondaryText,
    fontSize: typography.sizes.xs,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
})
