import * as React from 'react'
import {createStackNavigator} from '@react-navigation/stack'

const Stack = createStackNavigator()

const [SignIn, SignUp, ForgotPassword, Root] = [null, null, null, null]

export default function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="Root" component={Root} />
    </Stack.Navigator>
  )
}
