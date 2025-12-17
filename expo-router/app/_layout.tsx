import '../tamagui-web.css'

import { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { Provider } from 'components/Provider'
import { useTheme } from 'tamagui'
import { useProductsStore } from '../store/products'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Colors } from 'constants/Colors'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  const initialize = useProductsStore((state) => state.initialize)
  const isInitialized = useProductsStore((state) => state.isInitialized)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if ((interLoaded || interError) && isInitialized) {
      // Hide the splash screen after the fonts have loaded and database is ready
      SplashScreen.hideAsync()
    }
  }, [interLoaded, interError, isInitialized])

  // Navigation bar visibility is now handled by expo-navigation-bar plugin config
  // No runtime calls needed - this prevents layout shift on first load

  // Initialize notifications when database is ready
  // Note: Uses dynamic import to prevent crash in Expo Go
  useEffect(() => {
    if (isInitialized) {
      // Dynamic import to avoid loading expo-notifications at startup
      import('../utils/notifications').then(({ registerForPushNotifications, scheduleExpiryNotifications }) => {
        registerForPushNotifications().then(() => {
          scheduleExpiryNotifications();
        }).catch(() => {
          // Silently fail in Expo Go
        });
      }).catch(() => {
        // Silently fail if module can't be loaded
      });
    }
  }, [isInitialized]);

  if ((!interLoaded && !interError) || !isInitialized) {
    return null
  }

  return (
    <Providers>
      <RootLayoutNav />
    </Providers>
  )
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider>{children}</Provider>
    </GestureHandlerRootView>
  )
}

function RootLayoutNav() {
  const colorScheme = useColorScheme()
  const theme = useTheme()
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={colorScheme === 'light' ? 'dark' : 'dark'} />
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="product/[id]"
          options={{
            title: 'Edit Product',
            headerStyle: {
              backgroundColor: Colors.primary,
            },
            headerTintColor: '#FFF',
            headerShadowVisible: false,
          }}
        />

        <Stack.Screen
          name="modal"
          options={{
            title: 'Statistics',
            presentation: 'modal',
            animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            contentStyle: {
              backgroundColor: theme.background.val,
            },
          }}
        />

        <Stack.Screen
          name="scanner"
          options={{
            title: 'Scan Barcode',
            headerShown: false,
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </ThemeProvider>
  )
}
