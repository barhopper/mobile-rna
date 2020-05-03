import {Linking} from 'expo'
import * as Location from 'expo-location'
import * as Permissions from 'expo-permissions'

import {Alert} from 'react-native'

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  accuracy: Location.Accuracy.Highest,
  timeInterval: 5000,
  distanceInterval: 0,
}

export default async function getPermissionAsync(permission) {
  const {status} = await Permissions.askAsync(permission)
  if (status !== 'granted') {
    const permissionName = permission.toLowerCase().replace('_', ' ')
    Alert.alert(
      'Cannot be done 😞',
      `If you would like to use this feature, you'll need to enable the ${permissionName} permission in your phone settings.`,
      [
        {
          text: "Let's go!",
          onPress: () => Linking.openURL('app-settings:'),
        },
        {text: 'Nevermind', onPress: () => {}, style: 'cancel'},
      ],
      {cancelable: true},
    )

    return false
  }
  return true
}

export async function watchLocationWithPermission(
  callback,
  options = GEOLOCATION_OPTIONS,
) {
  if (await getPermissionAsync(Permissions.LOCATION)) {
    return Location.watchPositionAsync(options, callback)
  }
}

export async function getLocation(formatter = loc => loc) {
  if (await getPermissionAsync(Permissions.LOCATION)) {
    const location = await Location.getCurrentPositionAsync({})
    if (location) {
      return formatter(location)
    }
  } else {
    return null
  }
}
