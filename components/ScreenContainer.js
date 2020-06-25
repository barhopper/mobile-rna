import React from 'react'
import {
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
  Keyboard,
} from 'react-native'

export function ScreenContainer({children, style}) {
  const _style = Array.isArray(style) ? style : [style]

  return (
    <ScrollView style={[styles.container, ..._style]}>
      <KeyboardAvoidingView
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        style={[styles.container, ..._style]}
      >
        <TouchableWithoutFeedback
          style={[styles.container, ..._style]}
          onPress={Keyboard.dismiss}
        >
          {children}
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
})
