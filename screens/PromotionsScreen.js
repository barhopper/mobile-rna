import {default as React, useState, useRef, useEffect} from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Slider,
  Dimensions,
  SectionList,
} from 'react-native'
import {Layout, Text, Spinner} from '@ui-kitten/components'

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

export default function PromotionScreen({navigation}) {
  const [distance, setDistance] = useState(3)
  const [searchDistance, setSearchDistance] = useState(3)

  // Maybe we can get an initial location on the category scene to kick off
  const [location, setLocation] = useState([0, 0])

  const [allPromotions, setAllPromotions] = useState([])
  const [slotModifier, setSlotModifier] = useState(0)

  const subscription = useRef(null)

  // Using a manuel query to get a little more fine grained control
  const {error, status, data: promotions, isFetching} = useQuery(
    ['promotions', searchDistance, location, {slotModifier}],
    searchForPromotions,
  )

  useEffect(() => {
    navigation.addListener('focus', () => {
      // do something
      subscription.current = watchLocationWithPermission(handleLocationChange)
      navigation.setOptions({title: 'Promotions'})
    })

    navigation.addListener('blur', () => {
      // do something
      subscription.current?.remove?.()
      setSlotModifier(0)
      setAllPromotions([])
    })
  }, [navigation])

  useEffect(() => {
    if (Array.isArray(promotions) && promotions.length > 1) {
      let {timeslot} = promotions[0]

      setAllPromotions(current => {
        // prevent any dups from showing up
        if (current[current.length - 2]?.title === timeslot.seconds) {
          return current
        }
        return [
          ...current.slice(0, current.length - 1),
          {title: timeslot.seconds, data: promotions},
          {data: ['loading']},
        ]
      })
    }
  }, [promotions])

  useEffect(() => {
    setAllPromotions([])
    setSlotModifier(0)
  }, [searchDistance, location])

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
      {isFetching && allPromotions.length < 1 ? (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Spinner size="giant" />
        </View>
      ) : (
        <SectionList
          sections={allPromotions}
          keyExtractor={(item, index) => item + index}
          renderItem={props => (
            <PromotionCard
              {...props}
              onPress={handleSelect}
              TouchableOpacityProps={{style: {color: 'red'}}}
              isFetching={isFetching}
            />
          )}
          renderSectionHeader={({section: {title}}) => {
            if (!title) return null
            return (
              <InViewPort
                onChange={() => setSlotModifier(current => current + 1)}
              >
                <Text category="h4">{getTimeStringFromUTCEpoch(title)}</Text>
              </InViewPort>
            )
          }}
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
const PromotionCard = ({item: promotion, onPress, isFetching}) => {
  if (typeof promotion === 'string' && promotion === 'loading') {
    return isFetching && <Spinner size="giant" />
  }

  const {
    hitMetadata: {distance},
  } = promotion || {hitMetadata: {distance: 0}}
  const bar = {
    id: promotion.barId,
    barName: promotion.barName,
  }

  const {width} = Dimensions.get('window')
  const infoWidth = width - 60

  return (
    <TouchableOpacity style={cardStyles.card} onPress={() => onPress(bar)}>
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
    </TouchableOpacity>
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

function InViewPort(props) {
  const [rTop, setRTop] = useState(0)
  const [rBottom, setRBottom] = useState(0)
  const [rWidth, setRWidth] = useState(0)

  const interval = useRef(null)
  const myView = useRef(null)

  useEffect(() => {
    startWatching()
    return stopWatching
  }, [])

  useEffect(() => {
    isInViewPort()
  }, [rTop, rBottom, rWidth])

  const startWatching = () => {
    if (interval.current) {
      return
    }
    interval.current = setInterval(() => {
      if (!myView.current) {
        return
      }
      myView.current.measure((x, y, width, height, pageX, pageY) => {
        setRTop(pageY)
        setRBottom(pageY + height)
        setRWidth(pageX + width)
      })
    }, props.delay || 100)
  }

  const stopWatching = () => {
    interval.current = clearInterval(interval.current)
  }

  const isInViewPort = () => {
    const window = Dimensions.get('window')
    const isVisible =
      rBottom != 0 &&
      rTop >= 0 &&
      rBottom <= window.height &&
      rWidth > 0 &&
      rWidth <= window.width
    if (isVisible) {
      props.onChange(isVisible)
      stopWatching()
    }
  }

  return (
    <View
      collapsable={false}
      ref={component => {
        myView.current = component
      }}
      {...props}
    >
      {props.children}
    </View>
  )
}
