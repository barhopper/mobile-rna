import * as React from 'react'
import {StyleSheet} from 'react-native'
import {createStackNavigator} from '@react-navigation/stack'

import {default as CategorySelectScreen} from '../screens/HomeStack/CategorySelectScreen'
import {default as BarListScreen} from '../screens/HomeStack/BarListScreen'
import {default as BarReviewScreen} from '../screens/HomeStack/BarReviewScreen'
import {default as BarDetailScreen} from '../screens/HomeStack/BarDetailScreen'

import {default as theme} from '../constants/Theme'

const Stack = createStackNavigator()
const INITIAL_ROUTE_NAME = 'categories'

export default function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName={INITIAL_ROUTE_NAME}
      screenOptions={{
        headerStyle: styles.header,
        headerTintColor: theme['color-basic-100'],
      }}
    >
      <Stack.Screen name="categories" component={CategorySelectScreen} />
      <Stack.Screen name="listing" component={BarListScreen} />
      <Stack.Screen name="details" component={BarDetailScreen} />
      <Stack.Screen name="review" component={BarReviewScreen} />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme['color-primary-500'],
  },
})
