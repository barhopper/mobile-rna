import {Button, Input, Layout, Modal} from '@ui-kitten/components'
import {default as React, useState} from 'react'
import {Alert, Dimensions, StyleSheet} from 'react-native'
import {createAccountFromAnonymous} from '../../actions/auth'
import {useUpdateUser} from '../../contexts/userContext'

export function LinkAccountModal({updateProfileUser, buttonStyle}) {
  const [isOpen, setIsOpen] = useState(false)
  const updateUser = useUpdateUser()
  const toggleModal = () => setIsOpen(current => !current)

  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

  const {width} = Dimensions.get('window')
  const modalWidth = width - 64

  const handlePasswordChange = doAfterLogin => {
    if (password === email) {
      Alert.alert('Can not change password to the same thing')
    }
    createAccountFromAnonymous(email, password)
      .then(user => {
        updateProfileUser(user)
        console.log(user)
        if (typeof doAfterLogin === 'function') {
          doAfterLogin(user)
        }
        setEmail('')
        setPassword('')
        setIsOpen(false)
      })
      .catch(err => {
        Alert.alert(err.message)
      })
  }

  return (
    <>
      <Button appearance="filled" style={buttonStyle} onPress={toggleModal}>
        Create an Account
      </Button>
      <Modal
        visible={isOpen}
        onBackdropPress={toggleModal}
        backdropStyle={styles.backdrop}
      >
        <Layout style={[styles.modalContainer, {width: modalWidth}]}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={[styles.marginBottom]}
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            style={[styles.marginBottom]}
            secureTextEntry
          />
          <Button
            appearance="primary"
            style={[styles.marginBottom, styles.marginTop]}
            onPress={() => handlePasswordChange(updateUser)}
          >
            Create Account
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
