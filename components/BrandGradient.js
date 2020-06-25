import React from 'react'
// import {StyleSheet} from 'react-native'
import {LinearGradient} from 'expo-linear-gradient'
import {default as theme} from '../constants/Theme'

export function BrandGradient(props) {
  let _style = []
  if (props.style) {
    _style = Array.isArray(props.style) ? props.style : [props.style]
  }
  return (
    <LinearGradient
      colors={[theme['color-primary-500'], `#100`]}
      style={_style}
    >
      {props.children}
    </LinearGradient>
  )
}
