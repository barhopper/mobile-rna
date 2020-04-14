import {default as React, useEffect} from 'react'
import {StyleSheet} from 'react-native'
import {createStackNavigator} from '@react-navigation/stack'
import {useQuery} from 'react-query'

import {default as SignInScreen} from '../screens/SignInScreen'
import {default as SignUpScreen} from '../screens/SignUpScreen'
import {default as BottomTabNavigator} from '../navigation/BottomTabNavigator'

// import {getCurrentUserFromStorage} from '../actions/auth'
import {useUser, useUpdateUser} from '../contexts/userContext'

import {default as theme} from '../constants/Theme'

const getCurrentUserFromStorage = () => Promise.resolve(null)

const Stack = createStackNavigator()

export default function AuthStack() {
  const {data, status, error} = useQuery('user', getCurrentUserFromStorage)
  const user = useUser()
  const updateUser = useUpdateUser()

  useEffect(() => {
    updateUser(data)
  }, [data])

  switch (status) {
    case 'loading':
      return null
    case 'error':
      throw new Error(error)
    default:
      return (
        <Stack.Navigator
          screenOptions={{
            headerTintColor: theme['color-basic-100'],
            headerStyle: styles.header,
          }}
        >
          {user ? (
            <Stack.Screen name="root" component={BottomTabNavigator} />
          ) : (
            <>
              <Stack.Screen name="signin" component={SignInScreen} />
              <Stack.Screen name="signup" component={SignUpScreen} />
              {/* <Stack.Screen name="Forgot" component={ForgotPassword} /> */}
            </>
          )}
        </Stack.Navigator>
      )
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme['color-primary-500'],
  },
})
