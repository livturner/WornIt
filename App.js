import { useFonts, CormorantGaramond_400Regular_Italic, CormorantGaramond_700Bold } from '@expo-google-fonts/cormorant-garamond'
import { View, ActivityIndicator } from 'react-native'
import CameraScreen from './src/screens/CameraScreen'

export default function App() {
  const [fontsLoaded] = useFonts({
    'CormorantGaramond-Italic': CormorantGaramond_400Regular_Italic,
    'CormorantGaramond-Bold': CormorantGaramond_700Bold,
  })

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1C0F0A', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#FFFFF0" />
      </View>
    )
  }

  return <CameraScreen />
}