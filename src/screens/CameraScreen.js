import { useRef, useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { colors } from '../constants/colors'
import { typography } from '../constants/typography'
import { Ionicons } from '@expo/vector-icons'

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [photo, setPhoto] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [facing, setFacing] = useState('front')
  const cameraRef = useRef(null)

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

  const takePhoto = async () => {
    if (cameraRef.current) {
      setIsLoading(true)
      const result = await cameraRef.current.takePictureAsync()
      setPhoto(result.uri)
      console.log('Photo taken:', result.uri)
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.appName}>WornIt</Text>
          <TouchableOpacity 
            onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
            style={styles.flipButton}
          >
            <Ionicons name="camera-reverse-outline" size={28} color={colors.ivory} />
          </TouchableOpacity>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomBar}>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.ivory} />
          ) : (
            <TouchableOpacity style={styles.shutterButton} onPress={takePhoto}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>
          )}
        </View>

      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.espressoBark,
  },
  camera: {
    flex: 1,
  },
  topBar: {
    paddingTop: 60,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    color: colors.ivory,
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.cormorantItalic,
    letterSpacing: 3,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    alignItems: 'center',
  },
  flipButton: {
    padding: 8,
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'transparent',
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
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.espressoBark,
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
