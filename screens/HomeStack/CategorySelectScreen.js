import React, {useState} from 'react'
import {
  StyleSheet,
  View,
  TouchableHighlight,
  ScrollView,
  Dimensions,
} from 'react-native'
import {Layout, Text, Button} from '@ui-kitten/components'
import {useQuery} from 'react-query'

import {getCategories} from '../../actions/bars'

import {default as theme} from '../../constants/Theme'

export default function CategorySelectScreen({navigation}) {
  // TODO: we can make it so this query doesnt go stale so fast
  const {error, status, data: categories} = useQuery(
    'categories',
    getCategories,
  )
  const isLoading = status === 'loading'
  const windowHeight = Dimensions.get('window').height - 130

  const [selected, setSelected] = useState(new Set())

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
      <View style={{alignItems: 'center'}}>
        <Button
          status="primary"
          style={styles.searchButton}
          onPress={handleSearch}
        >
          GO
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
