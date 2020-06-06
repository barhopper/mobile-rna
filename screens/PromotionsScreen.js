import {default as React, useState, useRef, useEffect} from 'react'
import {
  StyleSheet,
  View,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  Slider,
  Dimensions,
} from 'react-native'
import {Layout, Text, Icon, Spinner, List} from '@ui-kitten/components'

import {default as theme} from '../constants/Theme'
import {useQuery} from 'react-query'
import {searchForPromotions} from '../actions/promotions'
import {watchLocationWithPermission} from '../utils/permissions'
import {geo} from '../services/firebase'

import moment from 'moment'

/***********************************************************
 *
 *
 *  Promotions
 *
 *
 ***********************************************************/

function getTimeStringFromUTCEpoch(seconds) {
  var d = new Date(0) // The 0 there is the key, which sets the date to the epoch
  d.setUTCSeconds(seconds) // add the seconds since utc epoch
  let timeString = moment(d).format('hh:mm')
  return timeString
}

export default function PromotionScreen({route, navigation}) {
  const [distance, setDistance] = useState(3)
  const [searchDistance, setSearchDistance] = useState(3)

  // Maybe we can get an initial location on the category scene to kick off
  const [location, setLocation] = useState([0, 0])

  const [allPromotions, setAllPromotions] = useState({})
  const [slotModifier, setSlotModifier] = useState(0)

  const subscription = useRef(null)

  // Using a manuel query to get a little more fine grained control
  const {error, status, data: promotions, isFetching} = useQuery(
    ['promotions', searchDistance, location, {slotModifier}],
    searchForPromotions,
  )

  const isLoading = isFetching && Object.keys(allPromotions).length < 1

  useEffect(() => {
    navigation.addListener('focus', () => {
      // do something
      subscription.current = watchLocationWithPermission(handleLocationChange)
      navigation.setOptions({title: 'Promotions'})
      setSlotModifier(0)
    })

    navigation.addListener('blur', () => {
      // do something
      subscription.current?.remove?.()
    })
  }, [navigation])

  useEffect(() => {
    if (Array.isArray(promotions) && promotions.length > 0) {
      let {timeslot} = promotions[0]

      setAllPromotions(current => ({
        ...current,
        [timeslot.seconds]: promotions,
      }))
    }
  }, [promotions])

  if (status === 'error') {
    throw error
  }

  const handleLocationChange = loc => {
    const {
      coords: {latitude, longitude},
    } = loc
    const newPoint = geo.point(latitude, longitude)

    if (!location) {
      setLocation([latitude, longitude])
    } else {
      setLocation(currentLoc => {
        const [currentLat, currentLon] = currentLoc
        const currentPoint = geo.point(currentLat, currentLon)

        const diff = geo.distance(newPoint, currentPoint)
        if (diff >= searchDistance * 0.1) {
          return [latitude, longitude]
        } else {
          return currentLoc
        }
      })
    }
  }

  const handleSelect = bar => {
    navigation.navigate('details', {bar})
  }

  return (
    <Layout style={styles.container}>
      <Layout style={styles.search}>
        <View style={styles.sliderContainer}>
          <Text category="label">Distance</Text>
          <Slider
            style={{width: 200, height: 40}}
            minimumTrackTintColor={theme['color-primary-300']}
            maximumTrackTintColor="#000000"
            thumbTintColor={theme['color-primary-500']}
            minimumValue={0.5}
            maximumValue={25}
            step={0.5}
            value={distance}
            onValueChange={setDistance}
            onSlidingComplete={setSearchDistance}
          />
          <Text category="label">{distance} Mi.</Text>
        </View>
      </Layout>
      {isLoading ? (
        <Spinner status="basic" size="giant" />
      ) : (
        <List
          data={promotions}
          renderItem={props => (
            <PromotionCard
              {...props}
              onPress={handleSelect}
              TouchableOpacityProps={{style: {color: 'red'}}}
            />
          )}
        />
      )}
    </Layout>
  )
}

PromotionScreen.navigationOptions = {
  header: null,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: theme['color-basic-200'],
    paddingVertical: 0,
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
  lightText: {
    color: theme['color-basic-100'],
  },
})

/***********************************************************
 *
 *
 *  Promo CARD
 *
 *
 ***********************************************************/
const PromotionCard = ({item: promotion, onPress}) => {
  const {
    hitMetadata: {distance},
  } = promotion
  const bar = {
    id: promotion.barId,
    barName: promotion.barName,
  }

  const {width} = Dimensions.get('window')
  const infoWidth = width - 60

  return (
    <View style={cardStyles.card} onPress={() => onPress(bar)}>
      <Text
        category="p2"
        appearance="hint"
        style={[cardStyles.details, {width: infoWidth}]}
        numberOfLines={3}
      >
        {promotion.text}
      </Text>
      <View style={cardStyles.header}>
        <Text category="label" style={{fontWeight: 'bold', fontSize: 12}}>
          {bar.barName}
        </Text>
        <Text category="label">{distance.toFixed(2)} Mi.</Text>
      </View>
      <View style={cardStyles.redbar}></View>
      {/* Description */}
    </View>
  )
}
const cardStyles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 15,
    backgroundColor: theme['color-basic-100'],
    marginBottom: 10,
    flex: 1,
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
