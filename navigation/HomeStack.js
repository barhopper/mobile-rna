import * as React from 'react'
import {createStackNavigator} from '@react-navigation/stack'

import {default as CategorySelectScreen} from '../screens/HomeStack/CategorySelectScreen'
import {default as BarListScreen} from '../screens/HomeStack/BarListScreen'

const Stack = createStackNavigator()

export default function HomeStack() {
  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen name="home" component={CategorySelectScreen} />
      <Stack.Screen name="listing" component={BarListScreen} />
      {/* <Stack.Screen name="Detail" component={Detail} />
      <Stack.Screen name="Review" component={Review} /> */}
    </Stack.Navigator>
  )
}
