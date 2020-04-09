import * as React from 'react'
import {createStackNavigator} from '@react-navigation/stack'

const Stack = createStackNavigator()

const [Search, Listing, Detail, Review] = [null, null, null, null]

export default function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="Listing" component={Listing} />
      <Stack.Screen name="Detail" component={Detail} />
      <Stack.Screen name="Review" component={Review} />
    </Stack.Navigator>
  )
}
