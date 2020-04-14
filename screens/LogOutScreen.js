import React from 'react'
import {StyleSheet} from 'react-native'
import {Layout, Text, Button} from '@ui-kitten/components'

import {signOut} from '../actions/auth'
import {useUpdateUser} from '../contexts/userContext'

export default function HomeScreen() {
  const updateUser = useUpdateUser()

  return (
    <Layout style={styles.container}>
      <Text>This is basically The HomeScreen</Text>
      <Button status="primary" onPress={() => signOut(() => updateUser(null))}>
        Log Out
      </Button>
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
