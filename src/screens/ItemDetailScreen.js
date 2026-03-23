import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../constants/colors'

export default function ItemDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={{ color: colors.ivory }}>Item Detail</Text>
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
})