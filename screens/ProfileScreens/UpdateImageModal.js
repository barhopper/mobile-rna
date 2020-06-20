import {default as React, useState, useEffect} from 'react'
import {Image, Dimensions, StyleSheet} from 'react-native'
import {Button, Layout, Modal} from '@ui-kitten/components'
import {default as ImagePicker} from 'expo-image-picker'
import Constants from 'expo-constants'

export function UpdateImageModal() {
  const [image, setImage] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const toggleModal = () => setIsModalOpen(current => !current)

  const {width} = Dimensions.get('window')
  const modalWidth = width - 64

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
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    // console.log(result)

    if (!result.cancelled) {
      setImage(result.uri)
    }
  }

  return (
    <>
      <Button appearance="ghost" onPress={toggleModal}>
        Edit Image
      </Button>
      <Modal
        visible={isModalOpen}
        onBackdropPress={toggleModal}
        backdropStyle={styles.backdrop}
      >
        <Layout style={[styles.modalContainer, {width: modalWidth}]}>
          {image && (
            <Image source={{uri: image}} style={{width: 200, height: 200}} />
          )}
          <Button onPress={pickImage}>Pick an image from camera roll</Button>
        </Layout>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  marginBottom: {
    marginBottom: 16,
  },
  marginTop: {
    marginTop: 16,
  },
})
