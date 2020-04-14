import {default as React, useEffect} from 'react'
import {createStackNavigator} from '@react-navigation/stack'
import {useQuery} from 'react-query'

import {default as SignInScreen} from '../screens/SignInScreen'
import {default as SignUpScreen} from '../screens/SignUpScreen'
import {default as BottomTabNavigator} from '../navigation/BottomTabNavigator'

// import {getCurrentUserFromStorage} from '../actions/auth'
import {useUser, useUpdateUser} from '../contexts/userContext'

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
        <Stack.Navigator>
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
