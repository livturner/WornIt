import { useState } from 'react'
import {
  StyleSheet, Text, View, TextInput,
  ActivityIndicator, KeyboardAvoidingView,
  Platform, Pressable, ScrollView
} from 'react-native'
import { colors } from '../constants/colors'
import { typography } from '../constants/typography'
import { supabase } from '../services/supabase'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState(null)

  const handleAuth = async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle= {styles.inner}
        keyboardShouldPersistTaps="handled"
      >
          {/* Logo */}
          <View style={styles.header}>
            <Text style={styles.appName}>
              <Text style={styles.appNameWhite}>Worn</Text>
              <Text style={styles.appNameBlue}>It</Text>
            </Text>
            <Text style={styles.tagline}>your daily outfit diary</Text>
          </View>

          {/* Tab switcher */}
          <View style={styles.tabRow}>
            <Pressable
              style={[styles.tab, !isSignUp && styles.tabActive]}
              onPress={() => { setIsSignUp(false); setError(null) }}
            >
              <Text style={[styles.tabText, !isSignUp && styles.tabTextActive]}>Log in</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, isSignUp && styles.tabActive]}
              onPress={() => { setIsSignUp(true); setError(null) }}
            >
              <Text style={[styles.tabText, isSignUp && styles.tabTextActive]}>Sign up</Text>
            </Pressable>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#666"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleAuth}
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={handleAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.ivory} />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? 'Create account' : 'Log in'}
                </Text>
              )}
            </Pressable>
          </View>

        </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.oliveGreen,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fonts.cormorantItalic,
    letterSpacing: 4,
    marginBottom: 8,
  },
  appNameWhite: {
    color: colors.ivory,
  },
  appNameBlue: {
    color: colors.steelBlue,
  },
  tagline: {
    color: colors.tertiaryText,
    fontSize: typography.sizes.sm,
    letterSpacing: 1,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: 24,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.oliveGreen,
  },
  tabText: {
    color: colors.secondaryText,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  tabTextActive: {
    color: colors.ivory,
    fontWeight: typography.weights.bold,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: colors.cardBackground,
    color: colors.ivory,
    borderRadius: 12,
    padding: 16,
    fontSize: typography.sizes.md,
    borderWidth: 1,
    borderColor: '#333',
  },
  errorText: {
    color: colors.errorText,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.steelBlue,
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: colors.ivory,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
})