import React, {useState} from 'react'
import {StyleSheet, View, Alert} from 'react-native'
import {Layout, Input, Button, Text, Icon} from '@ui-kitten/components'

import {BrandGradient} from '../components/BrandGradient'
import {signIn, SignInAnonymous} from '../actions/auth'
import {useUpdateUser} from '../contexts/userContext'

import {auth} from '../services/firebase'

// signIn doesnt use the normal theme so we need to overwrite but still stick to theme
import {default as theme} from '../constants/Theme'

export default function LoginScreen({navigation}) {
  const updateUser = useUpdateUser()

  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState(null)
  const clearEmailError = () => setEmailError(null)
  const handleEmailChange = value => {
    if (emailError) {
      clearEmailError(null)
    }
    setEmail(value)
  }

  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(null)
  const clearPasswordError = () => setPasswordError(null)
  const handlePasswordChange = value => {
    if (passwordError) {
      clearPasswordError(null)
    }
    setPassword(value)
  }

  const loginError = emailError || passwordError

  const pushToSignUp = () => {
    navigation.push('signup')
  }

  const handleLogin = (loginPromise, doAfterLogin) => {
    Promise.resolve(loginPromise)
      .then(user => {
        if (typeof doAfterLogin === 'function') {
          doAfterLogin(user)
        }
      })
      .catch(err => {
        const [input, message] = interpretLoginError(err)
        switch (input) {
          case 'email':
            setEmailError(message)
            break
          case 'password':
            setPasswordError(message)
            break
          default:
            break
        }
      })
  }

  const handleLoginAsUser = () => {
    const login = signIn(null, email, password)
    handleLogin(login, updateUser)
  }

  const handleLoginAsGuest = () => {
    const login = SignInAnonymous(null, email, password)
    handleLogin(login, updateUser)
  }

  const handlePasswordReset = () => {
    if (!email) {
      Alert.alert(
        'Sorry',
        'Enter your email so we know where to send the reset email',
      )
      return
    }

    auth
      .sendPasswordResetEmail(email)
      .then(() => {
        Alert.alert(
          'Thanks',
          'Check your email for instructions on how to reset your password',
        )
      })
      .catch(err => {
        Alert.alert('Sorry', err.message)
      })
  }

  return (
    <Layout style={styles.layout}>
      <BrandGradient style={styles.container}>
        <View style={styles.loginContainer}>
          {loginError && (
            <View style={styles.error}>
              <Icon
                name="alert-triangle-outline"
                fill={theme['color-basic-100']}
                style={styles.icon}
              />
              <Text style={[styles.lightText, {paddingLeft: 15}]}>
                {loginError}
              </Text>
            </View>
          )}
          <Input
            style={styles.input}
            status={'basic'}
            label={evaProps => (
              <Text {...evaProps} style={[evaProps.style, styles.lightText]}>
                Email
              </Text>
            )}
            placeholder="Enter Your Email"
            value={email}
            onChangeText={handleEmailChange}
          />
          <Input
            style={styles.input}
            status={'basic'}
            label={evaProps => (
              <Text {...evaProps} style={[evaProps.style, styles.lightText]}>
                Password
              </Text>
            )}
            placeholder="Enter Your password"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
          />

          <Button
            style={[styles.button, styles.firstButton]}
            appearance="filled"
            onPress={handleLoginAsUser}
          >
            Login
          </Button>
          <Button
            style={[styles.button, styles.buttonLight]}
            appearance="outline"
            status="basic"
            onPress={pushToSignUp}
          >
            <Text style={styles.lightText}>Sign Up</Text>
          </Button>
          <Button
            style={styles.button}
            appearance="ghost"
            status="basic"
            onPress={handleLoginAsGuest}
          >
            <Text style={styles.lightText}>Continue Without Login</Text>
          </Button>
          {passwordError && (
            <Button
              style={styles.button}
              appearance="ghost"
              status="basic"
              onPress={handlePasswordReset}
            >
              <Text style={styles.lightText}>Reset Password</Text>
            </Button>
          )}
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
  error: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 3,
  },
  icon: {
    width: 24,
    height: 24,
  },
})

function interpretLoginError(error) {
  const {message} = error
  if (message.match('no user record')) {
    return ['email', 'Email is invalid']
  } else if (message.match('email address is bad')) {
    return ['email', 'Email is invalid']
  } else if (message.match('password is invalid')) {
    return ['password', 'Password is incorrect']
  }

  return ['other', "We couldn't login"]
}
