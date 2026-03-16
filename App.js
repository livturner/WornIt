import { useFonts, CormorantGaramond_400Regular_Italic, CormorantGaramond_700Bold } from '@expo-google-fonts/cormorant-garamond'
import { View, Text } from 'react-native'
import CameraScreen from './src/screens/CameraScreen'

export default function App() {
  const [fontsLoaded] = useFonts({
    'CormorantGaramond-Italic': CormorantGaramond_400Regular_Italic,
    'CormorantGaramond-Bold': CormorantGaramond_700Bold,
  })

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1C0F0A', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 48, letterSpacing: 4 }}>
          <Text style={{ color: '#FFFFF0' }}>Worn</Text>
          <Text style={{ color: '#4682B4' }}>It</Text>
        </Text>
      </View>
    )
  }

  return <CameraScreen />
}