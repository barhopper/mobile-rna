import {default as React, useState} from 'react'
import {StyleSheet, Dimensions, Alert} from 'react-native'
import {Button, Modal, Input, Layout} from '@ui-kitten/components'

import {changePassword} from '../../actions/auth'

export function PasswordChangeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const toggleModal = () => setIsOpen(current => !current)

  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const {width} = Dimensions.get('window')
  const modalWidth = width - 64

  const handlePasswordChange = () => {
    if (password === newPassword) {
      Alert.alert('Can not change password to the same thing')
    }
    changePassword(password, newPassword)
      .then(() => {
        setPassword('')
        setNewPassword('')
        setIsOpen(false)
      })
      .catch(err => {
        Alert.alert(err.message)
      })
  }

  return (
    <>
      <Button appearance="ghost" onPress={toggleModal}>
        Change Password
      </Button>
      <Modal
        visible={isOpen}
        onBackdropPress={toggleModal}
        backdropStyle={styles.backdrop}
      >
        <Layout style={[styles.modalContainer, {width: modalWidth}]}>
          <Input
            label="Current Password"
            value={password}
            onChangeText={setPassword}
            style={[styles.marginBottom]}
          />
          <Input
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            style={[styles.marginBottom]}
          />
          <Button
            appearance="primary"
            style={[styles.marginBottom, styles.marginTop]}
            onPress={handlePasswordChange}
          >
            Change Password
          </Button>
          <Button
            appearance="ghost"
            style={[styles.marginBottom]}
            onPress={toggleModal}
          >
            Cancel
          </Button>
        </Layout>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
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
