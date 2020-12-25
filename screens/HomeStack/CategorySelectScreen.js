import {Button, Layout, Text} from '@ui-kitten/components'
import * as Linking from 'expo-linking'
import React, {useLayoutEffect, useState} from 'react'
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  View,
} from 'react-native'
import {useQuery} from 'react-query'
import {getCategories} from '../../actions/bars'
import {default as theme} from '../../constants/Theme'
import {firestore} from '../../services/firebase'

export default function CategorySelectScreen({navigation}) {
  // TODO: we can make it so this query doesnt go stale so fast

  const {error, status, data: categories} = useQuery(
    'categories',
    getCategories,
  )
  const isLoading = status === 'loading'
  const windowHeight = Dimensions.get('window').height - 130

  const [selected, setSelected] = useState(new Set())

  useLayoutEffect(() => {
    navigation.addListener('focus', () => {
      // do something
      navigation.setOptions({title: 'Search'})
    })

    Linking.addEventListener('url', event => {
      const url = Linking.parse(event.url)
      if (url.path === 'details') {
        console.log('is Detail', event.url.query)
        firestore
          .collection('Bars')
          .doc(url.queryParams.barId)
          .get()
          .then(snapshot => {
            const bar = {...snapshot.data(), id: snapshot.id}
            if (url.queryParams.type.toLowerCase() === 'checkin') {
              navigation.navigate('details', {bar, showCheckin: true})
            }
            if (url.queryParams.type.toLowerCase() === 'checkout') {
              navigation.navigate('review', {barId: bar.id})
            }
          })
      }
    })
  }, [navigation])

  const handleSelect = item => {
    let temp = new Set(selected.keys())
    if (selected.has(item)) {
      temp.delete(item)
    } else {
      temp.add(item)
    }
    setSelected(temp)
  }

  const handleSearch = () => {
    navigation.navigate('listing', {query: Array.from(selected)})
  }

  if (status === 'error') {
    throw error
  }

  return (
    <Layout style={styles.container}>
      <ScrollView style={{height: windowHeight}}>
        {isLoading ? (
          <Text>Loading</Text>
        ) : (
          <>
            <View style={styles.categoryContainer}>
              {Object.entries(categories).map(([cat, subCats]) => {
                return (
                  <View key={cat} style={styles.categoryView}>
                    <Text category="h5">{cat.toUpperCase()}</Text>
                    <View style={styles.subContainer}>
                      {subCats.map(subCat => {
                        return (
                          <CategoryItem
                            key={subCat}
                            subCat={subCat}
                            active={selected.has(subCat)}
                            onPress={handleSelect}
                          />
                        )
                      })}
                    </View>
                  </View>
                )
              })}
            </View>
          </>
        )}
      </ScrollView>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Button
          style={{flex: 0.45}}
          status="primary"
          appearance="outline"
          onPress={() => setSelected(new Set())}
        >
          Clear
        </Button>
        <Button style={{flex: 0.45}} status="primary" onPress={handleSearch}>
          Search
        </Button>
      </View>
    </Layout>
  )
}

CategorySelectScreen.navigationOptions = {
  header: null,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    justifyContent: 'flex-start',
  },
  categoryContainer: {
    flex: 1,
    marginBottom: 10,
  },
  categoryView: {
    flex: 1,
    marginBottom: 20,
  },
  subContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  searchButton: {
    width: 70,
    height: 70,
    borderRadius: 70,
    elevation: 3,
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: {
      height: 0,
      width: 0,
    },
  },
})

const CategoryItem = ({subCat, onPress, active}) => {
  const mainStyle = !active
    ? itemStyles.item
    : [itemStyles.item, itemStyles.activeItem]
  const textStyle = !active ? itemStyles.text : itemStyles.activeText

  return (
    <TouchableHighlight
      style={mainStyle}
      underlayColor={theme['color-primary-500']}
      onPress={() => onPress(subCat)}
    >
      <Text style={textStyle}>{subCat}</Text>
    </TouchableHighlight>
  )
}

const itemStyles = StyleSheet.create({
  item: {
    borderColor: theme['color-primary-500'],
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginVertical: 5,
    marginRight: 10,
    borderRadius: 50,
  },
  activeItem: {
    backgroundColor: theme['color-primary-500'],
  },
  text: {
    color: theme['color-primary-500'],
  },
  activeText: {
    color: theme['color-basic-100'],
  },
})
