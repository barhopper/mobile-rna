import * as React from 'react'
import {createStackNavigator} from '@react-navigation/stack'

import {default as CategorySelectScreen} from '../screens/HomeStack/CategorySelectScreen'
import {default as BarListScreen} from '../screens/HomeStack/BarListScreen'
import {default as BarReviewScreen} from '../screens/HomeStack/BarReviewScreen'
import {default as BarDetailScreen} from '../screens/HomeStack/BarDetailScreen'

const Stack = createStackNavigator()

export default function HomeStack() {
  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen name="home" component={CategorySelectScreen} />
      <Stack.Screen name="listing" component={BarListScreen} />
      <Stack.Screen name="details" component={BarDetailScreen} />
      <Stack.Screen name="review" component={BarReviewScreen} />
    </Stack.Navigator>
  )
}
