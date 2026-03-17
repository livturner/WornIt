import { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
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
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.appName}>
          <Text style={styles.appNameWhite}>Worn</Text>
          <Text style={styles.appNameBlue}>It</Text>
        </Text>
        <Text style={styles.tagline}>your daily outfit diary</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
        />

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <TouchableOpacity
          style={styles.button}
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
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsSignUp(!isSignUp)}
        >
          <Text style={styles.switchText}>
            {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.oliveGreen,
    justifyContent: 'center',
    padding: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
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
    color: '#888',
    fontSize: typography.sizes.sm,
    letterSpacing: 1,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: '#1E2318',
    color: colors.ivory,
    borderRadius: 12,
    padding: 16,
    fontSize: typography.sizes.md,
    borderWidth: 1,
    borderColor: '#333',
  },
  errorText: {
    color: colors.wineRed,
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
  buttonText: {
    color: colors.ivory,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  switchButton: {
    alignItems: 'center',
    padding: 12,
  },
  switchText: {
    color: '#888',
    fontSize: typography.sizes.sm,
  },
})