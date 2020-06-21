import {default as React, useEffect} from 'react'
import {Alert} from 'react-native'
import {Button} from '@ui-kitten/components'
import * as ImagePicker from 'expo-image-picker'
import Constants from 'expo-constants'

import {changeUserImageAsync} from '../../actions/auth'
import {useUpdateUser} from '../../contexts/userContext'

export function UpdateImageModal() {
  const updateUser = useUpdateUser()

  useEffect(() => {
    ;(async () => {
      if (Constants.platform.ios) {
        const {status} = await ImagePicker.requestCameraRollPermissionsAsync()
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!')
        }
      }
    })()
  }, [])

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    })

    // console.log(result)

    if (!result.cancelled) {
      changeUserImageAsync(result).then(photoURL => {
        Alert.alert('Success', 'Image updated succesfully')
        updateUser(current => {
          return {
            ...current,
            photoURL,
          }
        })
      })
    }
  }

  return (
    <Button appearance="ghost" onPress={pickImage}>
      Edit Image
    </Button>
  )
}
