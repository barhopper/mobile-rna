import {default as React, useState, useEffect} from 'react'
import {StyleSheet, View, TouchableHighlight} from 'react-native'
import {Layout, Text, Icon, Card, Spinner} from '@ui-kitten/components'

import {default as theme} from '../../constants/Theme'
import {useQuery} from 'react-query'
import {searchForBars} from '../../actions/bars'

export default function BarListScreen({route}) {
  const [tags, setTags] = useState([])
  const {error, status, data} = useQuery(['bars', tags], searchForBars)

  const {query} = route.params
  useEffect(() => {
    setTags(query)
  }, [query])

  if (status === 'error') {
    throw error
  }

  return (
    <Layout style={styles.container}>
      <Layout style={styles.search}>
        <Layout>
          <Text>I---------------[]-----------------------I</Text>
        </Layout>
        <Layout style={styles.tagContainer}>
          {tags.map(tag => (
            <TouchableHighlight
              key={tag}
              style={styles.tag}
              underlayColor={theme['color-primary-200']}
            >
              <>
                <Text style={styles.lightText}>{tag}</Text>
                <Icon
                  name="close-circle-outline"
                  fill={theme['color-primary-200']}
                  style={styles.closeIcon}
                />
              </>
            </TouchableHighlight>
          ))}
        </Layout>
      </Layout>
      <Layout>
        {status === 'loading' ? (
          <Spinner status="primary" size="giant" />
        ) : (
          <>
            <Text>Results</Text>
            <Text>{JSON.stringify(data)}</Text>
          </>
        )}
      </Layout>
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
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  closeIcon: {
    height: 15,
    width: 15,
    marginLeft: 7,
    marginBottom: -2,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme['color-primary-500'],
    marginRight: 10,
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 50,
  },
  lightText: {
    color: theme['color-basic-100'],
  },
})

const barCard = ({barInfo}) => {
  return (
    <Card>
      {/* Image */}
      <View>
        {/* Header */}
        {/* Description */}
      </View>
    </Card>
  )
}
