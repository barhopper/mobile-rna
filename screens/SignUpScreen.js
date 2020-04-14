import React, {useState} from 'react'
import {StyleSheet, View} from 'react-native'
import {Layout, Input, Button, Text, Icon} from '@ui-kitten/components'

import {BrandGradient} from '../components/BrandGradient'
import {signUp} from '../actions/auth'

import {useUpdateUser} from '../contexts/userContext'

// signIn doesnt use the normal theme so we need to overwrite but still stick to theme
import {default as theme} from '../constants/Theme'

export default function SignUpScreen({navigation}) {
  const updateUser = useUpdateUser()

  //   const [validation, setValidation] = useState({
  //     email: {
  //       isValid: false,
  //     },
  //     password: {
  //       hasLength: false,
  //       hasUppercase: false,
  //       hasNumber: false,
  //     },
  //   })

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

  const pushToSignIn = () => {
    navigation.pop()
  }

  const handleSignup = doAfterLogin => {
    signUp(null, email, password)
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
              g
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
          <View style={styles.validContainer}>
            <View style={styles.validSpan}>
              <Icon
                name="close-circle-outline"
                fill={theme['color-basic-100']}
                style={styles.validationIcon}
              />
              <Text style={[styles.lightText, styles.validationText]}>
                Valid Email
              </Text>
            </View>
          </View>
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
          <View style={styles.validContainer}>
            <View style={styles.validSpan}>
              <Icon
                name="close-circle-outline"
                fill={theme['color-basic-100']}
                style={styles.validationIcon}
              />
              <Text style={[styles.lightText, styles.validationText]}>
                At least 8 characters long
              </Text>
            </View>
            <View style={styles.validSpan}>
              <Icon
                name="close-circle-outline"
                fill={theme['color-basic-100']}
                style={styles.validationIcon}
              />
              <Text style={[styles.lightText, styles.validationText]}>
                Contains uppercase letter
              </Text>
            </View>
            <View style={styles.validSpan}>
              <Icon
                name="close-circle-outline"
                fill={theme['color-basic-100']}
                style={styles.validationIcon}
              />
              <Text style={[styles.lightText, styles.validationText]}>
                Contains a number
              </Text>
            </View>
          </View>

          <Button
            style={[styles.button, styles.firstButton]}
            appearance="filled"
            onPress={() => handleSignup(updateUser)}
          >
            Create Account
          </Button>
          <Button
            style={styles.button}
            appearance="ghost"
            status="basic"
            onPress={pushToSignIn}
          >
            <Text style={styles.lightText}>Log In</Text>
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
    // shadowRadius: '8px',
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
  validSpan: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  validationIcon: {
    height: 14,
    width: 14,
  },
  validationText: {
    fontSize: 14,
    marginLeft: 12,
    paddingVertical: 3,
  },
  validContainer: {
    padding: 15,
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
