import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors } from '../constants/colors'
import { typography } from '../constants/typography'
import { supabase } from '../services/supabase'

export default function ProfileScreen() {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.oliveGreen,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    color: colors.ivory,
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fonts.cormorantItalic,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.ivory,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.ivory,
    fontSize: typography.sizes.md,
  },
})