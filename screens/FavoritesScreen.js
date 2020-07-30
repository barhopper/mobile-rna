import {default as React, useState, useEffect} from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native'
import {Layout, Text, Spinner, List} from '@ui-kitten/components'

import {default as theme} from '../constants/Theme'
import {useQuery} from 'react-query'
import {getFavorites} from '../actions/favorites'

import {useUser} from '../contexts/userContext'

/***********************************************************
 *
 *
 *  Favorite LIST
 *
 *
 ***********************************************************/

export default function FavoriteListScreen({navigation}) {
  const user = useUser()
  const {error, status, data: favorites} = useQuery(
    ['favorites', user?.uid],
    getFavorites,
  )

  const [favList, setFavList] = useState([])

  useEffect(() => {
    if (favorites && typeof favorites === 'object')
      setFavList(Object.values(favorites))
  }, [favorites])

  if (status === 'error') {
    throw error
  }

  const handleSelect = favorite => {
    let bar = {...favorite}
    bar.id = bar.barId
    bar.fromFav = true
    navigation.navigate('details', {bar})
  }

  return (
    <Layout style={styles.container}>
      {status === 'loading' ? (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Spinner size="giant" />
        </View>
      ) : (
        <List
          data={favList}
          renderItem={props => (
            <BarCard {...props} key={props.item.id} onPress={handleSelect} />
          )}
        />
      )}
    </Layout>
  )
}

FavoriteListScreen.navigationOptions = {
  header: null,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: theme['color-basic-200'],
  },
  search: {
    backgroundColor: theme['color-basic-200'],
    marginBottom: 15,
  },
  results: {
    flex: 0.7,
    justifyContent: 'flex-start',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
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
    elevation: 3,
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: {
      height: 0,
      width: 0,
    },
  },
  lightText: {
    color: theme['color-basic-100'],
  },
})

/***********************************************************
 *
 *
 *  BAR CARD
 *
 *
 ***********************************************************/
const BarCard = ({item: favorite, onPress}) => {
  const {width} = Dimensions.get('window')
  const infoWidth = width - 30 - 115 - 30
  // Object {
  //   "barAddress": "",
  //   "barCoverImage": "generic_bar_01.png",
  //   "barDescription": "",
  //   "barName": "O'Keefe's Bar & Grill",
  //   "imgUrl": "https://firebasestorage.googleapis.com/v0/b/barhopper-269017.appspot.com/o/images%2Fgeneric_bar_01.png?alt=media&token=1f485973-314c-4533-93fe-14f6d91c77fe",
  // }

  return (
    <TouchableOpacity style={cardStyles.card} onPress={() => onPress(favorite)}>
      {/* Image */}
      <View style={cardStyles.card}>
        <View>
          <Image style={cardStyles.image} source={{uri: favorite.imgUrl}} />
        </View>
        <View stytle={cardStyles.info}>
          {/* Header */}
          <View style={cardStyles.header}>
            <Text category="label" style={{fontWeight: 'bold', fontSize: 12}}>
              {favorite.barName}
            </Text>
          </View>
          <View style={cardStyles.redbar}></View>
          {/* Description */}
          <Text
            category="p2"
            appearance="hint"
            style={[cardStyles.details, {width: infoWidth}]}
            numberOfLines={3}
          >
            {''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const cardStyles = StyleSheet.create({
  card: {
    height: 115,
    borderRadius: 10,
    flexDirection: 'row',
    padding: 0,
    backgroundColor: theme['color-basic-100'],
    marginBottom: 10,
    flex: 1,
  },
  image: {
    height: 115,
    width: 115,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginRight: 15,
  },
  info: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    height: 115,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
  },
  header: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  redbar: {
    height: 1,
    width: 30,
    borderBottomColor: theme['color-primary-500'],
    borderBottomWidth: 3,
    marginBottom: 10,
  },
  lightText: {
    color: theme['color-basic-100'],
  },
})
