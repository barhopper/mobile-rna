import * as React from 'react'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'

import TabBarIcon from '../components/TabBarIcon'

import {default as HomeStack} from './HomeStack'
import {default as PromotionScreen} from '../screens/PromotionsScreen'
import LogOutScreen from '../screens/LogOutScreen'
import LinksScreen from '../screens/LinksScreen'

import Colors from '../constants/Colors'

const BottomTab = createBottomTabNavigator()
const INITIAL_ROUTE_NAME = 'homeRoot'

export default function BottomTabNavigator({navigation, route}) {
  // Set the header title on the parent stack navigator depending on the
  // currently active tab. Learn more in the documentation:
  // https://reactnavigation.org/docs/en/screen-options-resolution.html
  navigation.setOptions({
    headerTitle: getHeaderTitle(route),
    headerShown: getHeaderMode(route),
  })

  return (
    <BottomTab.Navigator
      initialRouteName={INITIAL_ROUTE_NAME}
      tabBarOptions={{activeTintColor: Colors.tabTextSelected}}
    >
      <BottomTab.Screen
        component={HomeStack}
        name="Home"
        options={{
          tabBarIcon: ({focused}) => (
            <TabBarIcon focused={focused} name="home" />
          ),
        }}
      />
      <BottomTab.Screen
        name="Promotions"
        component={PromotionScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabBarIcon focused={focused} name="flash" />
          ),
        }}
      />
      <BottomTab.Screen
        name="Favorites"
        component={LinksScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabBarIcon focused={focused} name="star" />
          ),
        }}
        md
      />
      <BottomTab.Screen
        name="Profile"
        component={LogOutScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabBarIcon focused={focused} name="person" />
          ),
        }}
      />
    </BottomTab.Navigator>
  )
}

function getHeaderTitle(route) {
  const routeName =
    route.state?.routes[route.state.index]?.name ?? INITIAL_ROUTE_NAME
  // console.log(routeName)

  switch (routeName) {
    case 'Home':
      return 'Search'
    case 'Favorites':
      return 'Favorites'
    case 'Profile':
      return 'Profile'
    case 'Promotions':
      return 'Promotions'
  }
}

function getHeaderMode(route) {
  const routeName =
    route.state?.routes[route.state.index]?.name ?? INITIAL_ROUTE_NAME

  switch (routeName) {
    case 'Favorites':
    case 'Profile':
    case 'Promotions':
      return true
    default:
      return false
  }
}
