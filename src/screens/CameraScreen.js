import { useRef, useState, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { colors } from '../constants/colors'
import { typography } from '../constants/typography'
import { Ionicons } from '@expo/vector-icons'
import { identifyOutfit } from '../services/openai'
import ConfirmationScreen from './ConfirmationScreen'
import { saveOutfitLog } from '../services/wardrobeService'

export default function CameraScreen({navigation}) {
  const [permission, requestPermission] = useCameraPermissions()
  const [photo, setPhoto] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [facing, setFacing] = useState('front')
  const [items, setItems] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const cameraRef = useRef(null)
  const [countdown, setCountdown] = useState(null)
  const [timerEnabled, setTimerEnabled] = useState(false)

  useEffect(() => {
  if (photo) {
    analysePhoto()
  }
}, [photo])

const analysePhoto = async () => {
  setIsLoading(true)
  try {
    const identified = await identifyOutfit(photo)
    setItems(identified)
    console.log('Items identified:', identified)
  } catch (error) {
    console.error('GPT Vision error:', error)
  } finally {
    setIsLoading(false)
  }
}

const startCountdown = () => {
  setCountdown(3)
  const interval = setInterval(() => {
    setCountdown(prev => {
      if (prev === 1) {
        clearInterval(interval)
        capturePhoto()
        return null
      }
      return prev - 1
    })
  }, 1000)
}

const capturePhoto = async () => {
  if (cameraRef.current) {
    setIsLoading(true)
    const result = await cameraRef.current.takePictureAsync()
    setPhoto(result.uri)
    console.log('Photo taken:', result.uri)
  }
}

  // Permission still loading
  if (!permission) {
    return <View style={styles.container} />
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          WornIt needs camera access to log your outfits
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (photo && !isLoading && items.length > 0) {
  return (
    <ConfirmationScreen
      photo={photo}
      items={items}
      onRetake={() => {
        setPhoto(null)
        setItems([])
      }}
      onSave={async (confirmedItems) => {
        setIsSaving(true)
        try {
          await saveOutfitLog(photo, confirmedItems)
          console.log('Saved successfully')
          setPhoto(null)
          setItems([])
          navigation.navigate('Timeline')
        } catch (error) {
          console.error('Error saving outfit log:', error)
        } finally {
          setIsSaving(false)
        }
      }}
    />
    )
  }
  return (
    <View style={styles.container}>

      <View style={styles.topBar}>
        <Text style={styles.appName}>WornIt</Text>
      </View>

      <View style={styles.viewfinder}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.camera} />
        ) : (
          <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
        )}
      </View>

      <View style={styles.controlsBar}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.ivory} style={styles.loader} />
        ) : (
          <>
            <View style={styles.sideControl}>
              <TouchableOpacity
                onPress={() => setTimerEnabled(!timerEnabled)}
                style={styles.flipButton}
              >
                <Ionicons
                  name="timer-outline"
                  size={24}
                  color={timerEnabled ? colors.steelBlue : colors.ivory}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.shutterContainer}>
              {countdown !== null && (
                <Text style={styles.countdownText}>{countdown}</Text>
              )}
              <TouchableOpacity
                style={styles.shutterButton}
                onPress={timerEnabled ? startCountdown : capturePhoto}
                disabled={isLoading || countdown !== null}
              >
                <View style={styles.shutterInner} />
              </TouchableOpacity>
            </View>
            <View style={styles.sideControl}>
              <TouchableOpacity
                onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
                style={styles.flipButton}
              >
                <Ionicons name="camera-reverse-outline" size={28} color={colors.ivory} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.oliveGreen,
  },
  topBar: {
    paddingTop: 60,
    paddingBottom: 12,
    alignItems: 'center',
  },
  appName: {
    color: colors.ivory,
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.cormorantItalic,
    letterSpacing: 3,
  },
  viewfinder: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  controlsBar: {
    height: 130,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  sideControl: {
    width: 44,
    alignItems: 'center',
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.ivory,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.ivory,
  },
  flipButton: {
    padding: 8,
  },
  loader: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.oliveGreen,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionText: {
    color: colors.ivory,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: colors.steelBlue,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  permissionButtonText: {
    color: colors.ivory,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  shutterContainer: {
  alignItems: 'center',
  gap: 8,
},
countdownText: {
  color: colors.ivory,
  fontSize: typography.sizes.xxl,
  fontFamily: typography.fonts.cormorantItalic,
  lineHeight: typography.sizes.xxl,
},
})