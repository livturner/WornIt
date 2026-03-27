import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { colors } from '../constants/colors'

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.ivory} />
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
