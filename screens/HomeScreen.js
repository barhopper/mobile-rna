import React from 'react'
import {StyleSheet} from 'react-native'
import {Layout, Text} from '@ui-kitten/components'

export default function HomeScreen() {
  return (
    <Layout style={styles.container}>
      <Text>This is basically The HomeScreen</Text>
    </Layout>
  )
}

HomeScreen.navigationOptions = {
  header: null,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  contentContainer: {
    paddingTop: 30,
  },
})
