import { useState, useEffect } from 'react'
import { View, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useFonts, CormorantGaramond_400Regular_Italic, CormorantGaramond_700Bold } from '@expo-google-fonts/cormorant-garamond'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from './src/services/supabase'
import CameraScreen from './src/screens/CameraScreen'
import TimelineScreen from './src/screens/TimelineScreen'
import WardrobeScreen from './src/screens/WardrobeScreen'
import AuthScreen from './src/screens/AuthScreen'
import { colors } from './src/constants/colors'
import { typography } from './src/constants/typography'

const Tab = createBottomTabNavigator()

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
      <View style={{ flex: 1, backgroundColor: colors.oliveGreen, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'CormorantGaramond-Italic', fontSize: 48, letterSpacing: 4 }}>
          <Text style={{ color: '#FFFFF0' }}>Worn</Text>
          <Text style={{ color: '#4682B4' }}>It</Text>
        </Text>
      </View>
    )
  }

  if (!session) {
    return <AuthScreen />
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.oliveGreen,
            borderTopColor: '#1E2318',
            borderTopWidth: 1,
            height: 85,
            paddingBottom: 20,
          },
          tabBarActiveTintColor: colors.ivory,
          tabBarInactiveTintColor: '#666',
          tabBarIcon: ({ focused, color, size }) => {
            let iconName

            if (route.name === 'Timeline') {
              iconName = focused ? 'grid' : 'grid-outline'
            } else if (route.name === 'Camera') {
              iconName = focused ? 'camera' : 'camera-outline'
            } else if (route.name === 'Wardrobe') {
              iconName = focused ? 'shirt' : 'shirt-outline'
            }

            const iconSize = route.name === 'Camera' ? size + 4 : size

            return <Ionicons name={iconName} size={iconSize} color={color} />
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: typography?.fonts?.cormorantItalic,
          },
        })}
      >
        <Tab.Screen name="Timeline" component={TimelineScreen} />
        <Tab.Screen name="Camera" component={CameraScreen} />
        <Tab.Screen name="Wardrobe" component={WardrobeScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}