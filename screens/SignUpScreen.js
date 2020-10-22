import React, {useState, useRef} from 'react'
import {StyleSheet, View, useWindowDimensions} from 'react-native'
import {Input, Button, Text, Icon} from '@ui-kitten/components'

import {BrandGradient} from '../components/BrandGradient'
import {signUp} from '../actions/auth'

import {useUpdateUser} from '../contexts/userContext'

// signIn doesnt use the normal theme so we need to overwrite but still stick to theme
import {default as theme} from '../constants/Theme'

import {rEMAIL, rUPPERCASE, rNUMBER} from '../constants/regex'
import {ScreenContainer} from '../components/ScreenContainer'

export default function SignUpScreen({navigation}) {
  const updateUser = useUpdateUser()

  // TODO: all useState calls here could be part of one useReducer
  const [validation, setValidation] = useState({
    email: {
      isValid: false,
    },
    password: {
      hasLength: false,
      hasUppercase: false,
      hasNumber: false,
    },
    gender: {
      male: false,
      female: false,
    },
    status: {
      single: false,
      notSingle: false,
    },
  })

  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState(null)
  const clearEmailError = () => setEmailError(null)

  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(null)
  const clearPasswordError = () => setPasswordError(null)

  // const [gender, setGender] = useState('')
  // const [genderError, setGenderError] = useState(null)
  // const clearGenderError = () => setGenderError(null)

  // const [status, setStatus] = useState('')
  // const [statusError, setStatusError] = useState(null)
  // const clearStatusError = () => setStatusError(null)

  const validEmailIconRef = useRef()
  const passwordLengthIconRef = useRef()
  const passwordUpperIconRef = useRef()
  const passwordNumberIconRef = useRef()

  const height = useWindowDimensions().height - 100

  const loginError = emailError || passwordError

  const isEmailValid = validation.email.isValid
  const passwordHasLength = validation.password.hasLength
  const passwordHasUppercase = validation.password.hasUppercase
  const passwordHasNumber = validation.password.hasNumber
  // const [selectedGender, setSelectedGender] = React.useState(0)
  // const [selectedStatus, setSelectedStatus] = React.useState(0)

  const handleEmailChange = value => {
    if (emailError) {
      clearEmailError(null)
    }
    // check validation and update state
    const trimmed = value.trim()
    setValidation(current => {
      if (!!trimmed.match(rEMAIL) !== isEmailValid) {
        validEmailIconRef.current?.startAnimation()
      }
      return {
        ...current,
        email: {
          isValid: !!trimmed.match(rEMAIL),
        },
      }
    })
    setEmail(value)
  }

  const handlePasswordChange = value => {
    if (passwordError) {
      clearPasswordError(null)
    }

    setValidation(current => {
      if (value.length >= 8 !== passwordHasLength) {
        passwordLengthIconRef.current?.startAnimation()
      }
      if (!!value.match(rUPPERCASE) !== passwordHasUppercase) {
        passwordUpperIconRef.current?.startAnimation()
      }
      if (!!value.match(rNUMBER) !== passwordHasNumber) {
        passwordNumberIconRef.current?.startAnimation()
      }
      return {
        ...current,
        password: {
          hasLength: value.length >= 8,
          hasUppercase: !!value.match(rUPPERCASE),
          hasNumber: !!value.match(rNUMBER),
        },
      }
    })
    setPassword(value)
  }

  // const handleGenderChange = () => {
  //   if (genderError) {
  //     clearGenderError(null)
  //   }
  // }

  // const handleStatusChange = () => {
  //   if (statusError) {
  //     clearStatusError(null)
  //   }
  // }

  const pushToSignIn = () => {
    navigation.pop()
  }

  const handleSignup = doAfterLogin => {
    const isPassValid =
      passwordHasLength && passwordHasNumber && passwordHasUppercase
    if (!isEmailValid || !isPassValid) {
      return
    }

    signUp(null, email, password)
      .then(user => {
        if (typeof doAfterLogin === 'function') {
          doAfterLogin(user)
        }
      })
      .catch(err => {
        const [input, message] = interpretSignupError(err)
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
    <ScreenContainer style={{height}}>
      <BrandGradient style={[styles.container, {height}]}>
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
          <View style={styles.validContainer}>
            <View style={styles.validSpan}>
              <Icon
                {...(isEmailValid
                  ? {
                      name: 'checkmark-circle-2-outline',
                      fill: theme['color-success-300'],
                    }
                  : {
                      name: 'close-circle-outline',
                      fill: theme['color-basic-100'],
                    })}
                style={styles.validationIcon}
                animation="pulse"
                ref={validEmailIconRef}
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
                {...(passwordHasLength
                  ? {
                      name: 'checkmark-circle-2-outline',
                      fill: theme['color-success-300'],
                    }
                  : {
                      name: 'close-circle-outline',
                      fill: theme['color-basic-100'],
                    })}
                style={styles.validationIcon}
                animation="pulse"
                ref={passwordLengthIconRef}
              />
              <Text style={[styles.lightText, styles.validationText]}>
                At least 8 characters long
              </Text>
            </View>
            <View style={styles.validSpan}>
              <Icon
                {...(passwordHasUppercase
                  ? {
                      name: 'checkmark-circle-2-outline',
                      fill: theme['color-success-300'],
                    }
                  : {
                      name: 'close-circle-outline',
                      fill: theme['color-basic-100'],
                    })}
                style={styles.validationIcon}
                animation="pulse"
                ref={passwordUpperIconRef}
              />
              <Text style={[styles.lightText, styles.validationText]}>
                Contains uppercase letter
              </Text>
            </View>
            <View style={styles.validSpan}>
              <Icon
                {...(passwordHasNumber
                  ? {
                      name: 'checkmark-circle-2-outline',
                      fill: theme['color-success-300'],
                    }
                  : {
                      name: 'close-circle-outline',
                      fill: theme['color-basic-100'],
                    })}
                style={styles.validationIcon}
                animation="pulse"
                ref={passwordNumberIconRef}
              />
              <Text style={[styles.lightText, styles.validationText]}>
                Contains a number
              </Text>
            </View>
          </View>

          {/* <View
                style={{
                  justifyContent: 'left',
                  alignItems: 'left',
                  height: 150,
                }}
              >
              
                <Text style={[styles.lightText, styles.validationText]}>{`Please Select Gender:`}</Text>

                <RadioGroup
                  selectedIndex={selectedGender}
                  onChange={index => setSelectedGender(index)}
                >
                  <Radio
                    style={[styles.lightText, styles.validationText]}
                    label="Male"
                    name="gender"
                    fullWidth
                    value={gender}
                    onChange={handleGenderChange}
                  >
                    Male
                  </Radio>

                  <Radio
                    style={[styles.lightText, styles.validationText]}
                    label="Female"
                    name="gender"
                    fullWidth
                    value={gender}
                    onChange={handleGenderChange}
                  >
                    Female
                  </Radio>
                </RadioGroup>
              </View>
              <View
                style={{
                  justifyContent: 'left',
                  alignItems: 'left',
                  height: 120,
                }}
              >
                <Text style={[styles.lightText, styles.validationText]}>{`Please Select Status:`}</Text>
                <RadioGroup
                  selectedIndex={selectedStatus}
                  onChange={index => setSelectedStatus(index)}
                >
                  <Radio
                    style={[styles.lightText, styles.validationText]}
                    label="Single"
                    name="status"
                    fullWidth
                    value={status}
                    onChange={handleStatusChange}
                  >
                    Single
                  </Radio>
                  <Radio
                    style={[styles.lightText, styles.validationText]}
                    label="Not Single"
                    name="status"
                    fullWidth
                    value={status}
                    onChange={handleStatusChange}
                  >
                    Not Single
                  </Radio>
                </RadioGroup>
              </View> */}

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
    </ScreenContainer>
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
    height: 20,
    width: 20,
  },
  validationText: {
    fontSize: 15,
    marginLeft: 12,
    paddingVertical: 3,
  },
  validContainer: {
    padding: 15,
  },
})

function interpretSignupError(error) {
  const {message} = error
  if (message.match('already in use')) {
    return ['email', 'Email is already in use']
  } else if (message.match('email address is bad')) {
    return ['email', 'Email is invalid']
  }

  return ['other', "We couldn't sign up"]
}
