import React, {useState} from 'react'
import {StyleSheet, View} from 'react-native'
import {Layout, Input, Button, Text} from '@ui-kitten/components'

import {BrandGradient} from '../components/BrandGradient'
import {signIn} from '../actions/auth'

// signIn doesnt use the normal theme so we need to overwrite but still stick to theme
import {default as theme} from '../constants/Theme'

const useControlledInput = (initial = '') => {
  const [value, setValue] = useState(initial)
  return {value, onChangeText: setValue}
}

export default function LoginScreen() {
  const username = useControlledInput('')
  const password = useControlledInput('')

  const handleLogin = () => {
    signIn(null, username.value, password.value)
      .then(user => {
        console.log(user)
      })
      .catch(err => {
        console.log(err)
      })
  }

  return (
    <Layout style={styles.layout}>
      <BrandGradient style={styles.container}>
        <View style={styles.loginContainer}>
          <Input
            style={styles.input}
            label={evaProps => (
              <Text {...evaProps} style={[evaProps.style, styles.lightText]}>
                Email
              </Text>
            )}
            placeholder="Enter Your Email"
            {...username}
          />
          <Input
            style={styles.input}
            label={evaProps => (
              <Text {...evaProps} style={[evaProps.style, styles.lightText]}>
                Password
              </Text>
            )}
            placeholder="Enter Your password"
            {...password}
            secureTextEntry
          />
          <Button
            style={[styles.button, styles.firstButton]}
            appearance="filled"
            onPress={handleLogin}
          >
            Login
          </Button>
          <Button
            style={[styles.button, styles.buttonLight]}
            appearance="outline"
            status="basic"
          >
            <Text style={styles.lightText}>Sign Up</Text>
          </Button>
          <Button style={styles.button} appearance="ghost" status="basic">
            <Text style={styles.lightText}>Continue Without Login</Text>
          </Button>
        </View>
      </BrandGradient>
    </Layout>
  )
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  loginContainer: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  input: {
    marginVertical: 2,
  },
  button: {
    marginVertical: 10,
    // shadowColor: theme["color-basic-900"]
  },
  buttonLight: {
    borderColor: theme['color-basic-200'],
    // backgroundColor: theme['color-basic-transparent-200'],
  },
  lightText: {
    color: theme['color-basic-100'],
  },
  firstButton: {
    marginTop: 15,
  },
})
