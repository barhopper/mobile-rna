import {default as React} from 'react'
import {createStackNavigator} from '@react-navigation/stack'
import {useQuery} from 'react-query'

import {default as SignInScreen} from '../screens/SignInScreen'
import {default as BottomTabNavigator} from '../navigation/BottomTabNavigator'

// import {getCurrentUserFromStorage} from '../actions/auth'

const getCurrentUserFromStorage = () => Promise.resolve(null)

const Stack = createStackNavigator()

export default function AuthStack() {
  const {data, status, error} = useQuery('user', getCurrentUserFromStorage)
  // console.log(`data is ${data}`)
  switch (status) {
    case 'loading':
      return null
    case 'error':
      throw new Error(error)
    default:
      return (
        <Stack.Navigator>
          {data ? (
            <Stack.Screen name="Root" component={BottomTabNavigator} />
          ) : (
            <>
              <Stack.Screen name="SignIn" component={SignInScreen} />
              {/* <Stack.Screen name="SignUp" component={SignUp} />
              <Stack.Screen name="Forgot" component={ForgotPassword} /> */}
            </>
          )}
        </Stack.Navigator>
      )
  }
}
