import React from 'react'
import {StyleSheet} from 'react-native'
import {Layout, Text} from '@ui-kitten/components'

export default function BarListScreen({route}) {
  const {query} = route.params
  console.log(route.params)
  return (
    <Layout style={styles.container}>
      <Text>This is The Bar Select Screen</Text>

      {Array.from(query).map(q => (
        <Text key={q}>{q}</Text>
      ))}
    </Layout>
  )
}

BarListScreen.navigationOptions = {
  header: null,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
})
