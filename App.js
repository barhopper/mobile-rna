import * as React from 'react'
import {Platform, StatusBar, StyleSheet, View} from 'react-native'

// Expo
import {SplashScreen} from 'expo'
import * as Font from 'expo-font'
import {Ionicons} from '@expo/vector-icons'

// Navigator
import {NavigationContainer} from '@react-navigation/native'
import AuthStack from './navigation/AuthStack'
import useLinking from './navigation/useLinking'

// Kitten UI
import * as eva from '@eva-design/eva'
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components'
import {EvaIconsPack} from '@ui-kitten/eva-icons'
import {default as theme} from './constants/Theme'
import {default as mapping} from './mapping.js' // <-- Import app mapping

// Global State stuff
import {UserProvider} from './contexts/userContext'

// ErrorBoundary
import {default as ErrorBoundary} from './components/ErrorBoundary'

import {androidTimerWorkaround} from './utils/androidTimer'

// Use the android timer workaround to prevent problems with long timers
androidTimerWorkaround()

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false)
  const [initialNavigationState, setInitialNavigationState] = React.useState()
  const containerRef = React.useRef()
  const {getInitialState} = useLinking(containerRef)

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHide()

        // Load our initial navigation state
        setInitialNavigationState(await getInitialState())

        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
          'OpenSans-Regular': require('./assets/fonts/OpenSans-Regular.ttf'),
        })
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e)
      } finally {
        setLoadingComplete(true)
        SplashScreen.hide()
      }
    }

    loadResourcesAndDataAsync()
  }, [])

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    return null
  } else {
    return (
      <>
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider
          {...eva}
          theme={{...eva.light, ...theme}}
          customMapping={mapping}
        >
          <UserProvider>
            <ErrorBoundary>
              <View style={styles.container}>
                {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
                <NavigationContainer
                  ref={containerRef}
                  initialState={initialNavigationState}
                >
                  <AuthStack />
                </NavigationContainer>
              </View>
            </ErrorBoundary>
          </UserProvider>
        </ApplicationProvider>
      </>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
