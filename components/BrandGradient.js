import React from 'react'
// import {StyleSheet} from 'react-native'
import {LinearGradient} from 'expo-linear-gradient'
import {default as theme} from '../constants/Theme'

export function BrandGradient(props) {
  return (
    <LinearGradient
      colors={[theme['color-primary-500'], `#100`]}
      style={{
        ...props.style,
      }}
    >
      {props.children}
    </LinearGradient>
  )
}
