import { useState, useEffect } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { useFonts, CormorantGaramond_400Regular_Italic, CormorantGaramond_700Bold } from '@expo-google-fonts/cormorant-garamond'
import { supabase } from './src/services/supabase'
import CameraScreen from './src/screens/CameraScreen'
import AuthScreen from './src/screens/AuthScreen'

export default function App() {
  const [fontsLoaded] = useFonts({
    'CormorantGaramond-Italic': CormorantGaramond_400Regular_Italic,
    'CormorantGaramond-Bold': CormorantGaramond_700Bold,
  })

  const [session, setSession] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setCheckingAuth(false)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (!fontsLoaded || checkingAuth) {
    return (
      <View style={{ flex: 1, backgroundColor: '#2E3328', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'CormorantGaramond-Italic', fontSize: 48, letterSpacing: 4 }}>
          <Text style={{ color: '#FFFFF0' }}>Worn</Text>
          <Text style={{ color: '#4682B4' }}>It</Text>
        </Text>
      </View>
    )
  }

  return session ? <CameraScreen /> : <AuthScreen />
}