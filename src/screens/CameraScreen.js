import { useRef, useState, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { colors } from '../constants/colors'
import { typography } from '../constants/typography'
import { Ionicons } from '@expo/vector-icons'
import { identifyOutfit } from '../services/openai'
import ConfirmationScreen from './ConfirmationScreen'

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [photo, setPhoto] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [facing, setFacing] = useState('front')
  const [items, setItems] = useState([])
  const cameraRef = useRef(null)

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

  const takePhoto = async () => {
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
      onSave={(confirmedItems) => {
        console.log('Saving to wardrobe:', confirmedItems)
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
            <View style={styles.sideControl} />
            <TouchableOpacity
              style={styles.shutterButton}
              onPress={takePhoto}
              disabled={isLoading}
            >
              <View style={styles.shutterInner} />
            </TouchableOpacity>
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
})