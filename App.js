// Kitten UI
import * as eva from '@eva-design/eva'
import {Ionicons} from '@expo/vector-icons'
// Navigator
import {NavigationContainer} from '@react-navigation/native'
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components'
import {EvaIconsPack} from '@ui-kitten/eva-icons'
// Expo
import {SplashScreen} from 'expo'
import Constants from 'expo-constants'
import * as Font from 'expo-font'
import * as Linking from 'expo-linking'
import * as Notifications from 'expo-notifications'
import * as Permissions from 'expo-permissions'
// import useLinking from './navigation/useLinking'
import moment from 'moment'
import {default as React, useRef, useState} from 'react'
import {Platform, StatusBar, StyleSheet, View} from 'react-native'
import {generateId} from './actions/auth'
import {getBar, getMyCheckins, searchForBars} from './actions/bars'
// ErrorBoundary
import {default as ErrorBoundary} from './components/ErrorBoundary'
import {default as theme} from './constants/Theme'
// Global State stuff
import {UserProvider} from './contexts/userContext'
import {default as mapping} from './mapping.js' // <-- Import app mapping
import AuthStack from './navigation/AuthStack'
import {navigationRef} from './navigation/RootNavigation'
import {auth, firestore} from './services/firebase'
import {androidTimerWorkaround} from './utils/androidTimer'

// Use the android timer workaround to prevent problems with long timers
androidTimerWorkaround()
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false)
  // const [initialNavigationState, setInitialNavigationState] = React.useState()

  const [setExpoPushToken] = useState('')
  const [setNotification] = useState(false)
  const notificationListener = useRef()
  const responseListener = useRef()

  // const {getInitialState} = useLinking(containerRef)

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token))

    notificationListener.current = Notifications.addNotificationReceivedListener(
      notification => {
        setNotification(notification)
      },
    )

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      response => {
        console.log('Response', response)
        const url = response.notification.request.content.data.url
        Linking.openURL(url)
        console.log(url)
      },
    )

    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHide()

        // Load our initial navigation state
        // setInitialNavigationState(await getInitialState())

        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
          'OpenSans-Regular': require('./assets/fonts/OpenSans-Regular.ttf'),
          'OpenSans-Bold': require('./assets/fonts/OpenSans-Bold.ttf'),
          'OpenSans-SemiBold': require('./assets/fonts/OpenSans-SemiBold.ttf'),
          'OpenSans-Italic': require('./assets/fonts/OpenSans-Italic.ttf'),
          'OpenSans-Light': require('./assets/fonts/OpenSans-Light.ttf'),
          'OpenSans-ExtraBold': require('./assets/fonts/OpenSans-ExtraBold.ttf'),
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
    startGettingLocation()
    return () => {
      Notifications.removeNotificationSubscription(notificationListener)
      Notifications.removeNotificationSubscription(responseListener)
    }
  }, [])

  async function registerForPushNotificationsAsync() {
    let token
    if (Constants.isDevice) {
      const {status: existingStatus} = await Permissions.getAsync(
        Permissions.NOTIFICATIONS,
      )
      let finalStatus = existingStatus
      if (existingStatus !== 'granted') {
        const {status} = await Permissions.askAsync(Permissions.NOTIFICATIONS)
        finalStatus = status
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!')
        return
      }
      token = (await Notifications.getExpoPushTokenAsync()).data
      console.log(token)
    } else {
      alert('Must use physical device for Push Notifications')
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      })
    }

    return token
  }
  async function schedulePushNotification(bar, type) {
    const {id, barName} = bar
    const {currentUser} = auth
    console.log(bar)
    console.log(auth)
    const snapshot = await firestore
      .collection('Notifications')
      .where('barId', '==', id)
      .where('toUser', '==', currentUser.uid)
      .where('type', '==', type)
      .where('lastSent', '>', moment().subtract(60, 'minute').toISOString())
      .get()
    let hasNotification = false
    snapshot.forEach(doc => {
      const data = doc.data()
      if (data.barId === id && data.toUser === currentUser.uid) {
        hasNotification = true
      }
    })
    if (!hasNotification) {
      await firestore.collection('Notifications').doc(generateId()).set({
        type,
        barId: id,
        toUser: currentUser.uid,
        lastSent: moment().toISOString(),
      })
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Looks like you ${
            type === 'CHECKIN' ? 'are near' : 'left'
          } ${barName}`,
          body: `Want to ${type.toLowerCase()}?`,
          data: {
            type: type,
            url: Linking.makeUrl('details', {barId: id, type}),
          },
        },
        trigger: {seconds: 2},
      })
    }
  }

  const startGettingLocation = () => {
    navigator.geolocation.getCurrentPosition(
      position => {
        // const { error, status, data, isFetching } = useQuery(
        //   ['bars', 0.5,],
        //   searchForBars,
        // )
        const {currentUser} = auth
        if (currentUser) {
          getMyCheckins(currentUser.uid).then(checkins => {
            // console.log("Checkins", checkins);
            let barsNearMe = []
            searchForBars('bars', 0.03, [
              position.coords.latitude,
              position.coords.longitude,
            ]).then(bars => {
              console.log('Bars fetching', bars)
              console.log('My checkins', checkins)
              barsNearMe = bars
              bars.map(b => {
                const amICheckedIn = checkins.find(c => c.barId == b.id)
                if (!amICheckedIn) {
                  console.log('Schedule Push Notification')
                  schedulePushNotification(b, 'CHECKIN')
                  // submitCheckin({
                  //   barId: b.id,
                  //   userId: currentUser.uid,
                  // })
                }
              })
              const checkinsToRemove = []
              checkins.map(c => {
                console.log('Checkin : ', c)
                console.log('Bars near me ', barsNearMe)
                const isBarNear = barsNearMe.find(b => b.id === c.barId)
                console.log('IS bar near', isBarNear)
                if (!isBarNear) {
                  checkinsToRemove.push(c)
                }
              })
              console.log('Checkins to remove', checkinsToRemove)
              if (checkinsToRemove.length > 0) {
                checkinsToRemove.map(cr => {
                  getBar('bar', cr.barId).then(d => {
                    schedulePushNotification(d, 'CHECKOUT')
                  })
                })
              }
            })
          })
        }
      },
      error => console.error(error),
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 20000,
        distanceFilter: 10,
      },
    )
    //300000
    setTimeout(startGettingLocation, 60000)
  }

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
                  ref={navigationRef}
                  // initialState={initialNavigationState}
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
