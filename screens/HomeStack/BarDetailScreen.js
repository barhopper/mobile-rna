import {default as React, useLayoutEffect, useState, useEffect} from 'react'
import {
  StyleSheet,
  View,
  Dimensions,
  ImageBackground,
  ScrollView,
  FlatList,
  Linking,
} from 'react-native'
import {Layout, Text, Icon, Button} from '@ui-kitten/components'

// import {queryCache} from 'react-query'
import {imageRef} from '../../services/firebase'

import {default as theme} from '../../constants/Theme'
import {TouchableOpacity} from 'react-native-gesture-handler'
import {useQuery, queryCache} from 'react-query'
import {getBar} from '../../actions/bars'

export default function BarDetailScreen({route, navigation}) {
  const {bar: _bar} = route.params || {bar: {hitMetadata: {}}}
  const {
    hitMetadata: {distance},
  } = _bar

  // eslint-disable-next-line no-unused-vars
  const {error, status, data: bar} = useQuery(['bar', _bar.id], getBar, {
    initialData: _bar,
  })

  // const categories = queryCache.getQuery('categories')?.state.data
  // const allCategories = Object.values(categories || {}).reduce(
  //   (acc, cur) => acc.concat(cur),
  //   [],
  // )
  // const barCategories = allCategories?.filter(cat => {
  //   return bar[cat]
  // })

  const {width} = Dimensions.get('window')
  const fiftyPercent = width / 2
  const infoItemWidth = width / 2 - 30
  const floatingWidth = width - 30

  const reviewValues = Object.values(bar.reviews || {})
  const reviewTotal =
    reviewValues.reduce((acc, cur) => acc + (cur - 0), 0) - bar.reviews?.count
  const avgReview = reviewTotal > 0 && reviewTotal / (reviewValues.length - 1)
  const numStars = avgReview && Math.floor(avgReview / 2)

  let barHours = 'No Hours'
  if (bar.barOpeningHours && bar.barClosingHours) {
    barHours = `${bar.barOpeningHours} - ${bar.barClosingHours}`
  } else if (bar.barOpeningHours) {
    barHours = `open from ${bar.barOpeningHours}`
  } else if (bar.barClosingHours) {
    barHours = `open until ${bar.barClosingHours}`
  }

  // For the carousel we can use this to control what image we're seeing
  const [bannerImage, setBannerImage] = useState(0)
  const [carouselImages, setCarouselImages] = useState([bar.imgUrl])

  const rotateRight = () => {
    setBannerImage(current => (current + 1) % carouselImages.length)
  }

  const rotateLeft = () => {
    setBannerImage(current => {
      let remainder = (current - 1) % carouselImages.length
      return remainder >= 0 ? remainder : remainder + carouselImages.length
    })
  }

  useLayoutEffect(() => {
    navigation.addListener('focus', () => {
      // do something
      navigation.setOptions({title: bar.barName || 'Bar Details'})
      queryCache.refetchQueries(['bar', _bar.id])
    })
  }, [navigation, bar])

  useEffect(() => {
    if (bar.barImages) {
      let imgUrls = []

      let imgUrlPromises = bar.barImages.map(url => {
        return imageRef
          .child(url)
          .getDownloadURL()
          .then(res => imgUrls.push(res))
          .catch(e => console.log('Error: ', e))
      })

      Promise.all(imgUrlPromises).then(() => {
        console.log(imgUrls)
        setCarouselImages(imgUrls)
      })
    }
  }, [bar])

  useEffect(() => {
    setBannerImage(0)
  }, [carouselImages])

  const navigateToReview = () => {
    navigation.navigate('review', {barId: bar.id})
  }

  const loadInBrowser = url => {
    let _url = ''
    if (!url) return
    _url = typeof url !== 'string' ? url.toString() : url
    _url = _url.match(/http(s)?:\/\//) ? _url : `https://${_url}`
    Linking.openURL(`${_url}`).catch(err =>
      console.error("Couldn't load page", err),
    )
  }

  if (status === 'fetching') return null

  return (
    <Layout style={styles.container}>
      <ScrollView style={{flex: 1}}>
        {/* Carousel */}
        <ImageBackground
          style={styles.bannerImage}
          imageStyle={{resizeMode: 'cover'}}
          source={{uri: carouselImages[bannerImage] || bar.imgUrl}}
        >
          <View style={{flexDirection: 'row', flex: 1}}>
            <TouchableOpacity
              style={[styles.left, {width: fiftyPercent}]}
              onPress={rotateLeft}
            ></TouchableOpacity>
            <TouchableOpacity
              style={[styles.left, {width: fiftyPercent}]}
              onPress={rotateRight}
            ></TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}
          >
            {carouselImages.map((img, index) => {
              return (
                <TouchableOpacity
                  key={img}
                  style={{
                    height: 12,
                    width: 12,
                    borderRadius: 12,
                    backgroundColor:
                      theme[
                        `${
                          index === bannerImage
                            ? 'color-primary-200'
                            : 'color-basic-100'
                        }`
                      ],
                    marginHorizontal: 8,
                  }}
                  onPress={() => setBannerImage(index)}
                ></TouchableOpacity>
              )
            })}
          </View>
        </ImageBackground>

        {/* Info block with quick data points */}
        <View style={styles.infoBlock}>
          <View style={[styles.infoItem, {width: infoItemWidth}]}>
            <Icon
              name="paper-plane"
              fill={theme['color-primary-600']}
              style={styles.infoIcon}
            />
            <Text>{distance.toFixed(2)} Mi.</Text>
          </View>
          <View style={[styles.infoItem, {width: infoItemWidth}]}>
            <Icon
              name="smartphone-outline"
              fill={theme['color-primary-600']}
              style={styles.infoIcon}
            />
            <Text>{bar?.barPhone || 'No Phone Number'}</Text>
          </View>
          <View style={[styles.infoItem, {width: infoItemWidth}]}>
            <Icon
              name="pin"
              fill={theme['color-primary-600']}
              style={styles.infoIcon}
            />
            <Text>{bar?.barAddress || 'No Address'}</Text>
          </View>
          <View style={[styles.infoItem, {width: infoItemWidth}]}>
            <Icon
              name="clock-outline"
              fill={theme['color-primary-600']}
              style={styles.infoIcon}
            />
            <Text>{barHours}</Text>
          </View>
          <View style={[styles.infoItem, {width: infoItemWidth}]}>
            <Icon
              name="globe-outline"
              fill={theme['color-primary-600']}
              style={styles.infoIcon}
            />
            <Text>{bar.barUrl || 'No Website'}</Text>
          </View>
          <View style={[styles.infoItem, {width: infoItemWidth}]}>
            <Icon
              name="calendar-outline"
              fill={theme['color-primary-600']}
              style={styles.infoIcon}
            />
            <Text>{bar.barOpenDays || 'No Days'}</Text>
          </View>
        </View>
        {/* Live Stream Button */}
        {bar.liveUrl && (
          <Button
            appearance="ghost"
            size="small"
            onPress={() => loadInBrowser(bar.liveUrl || '')}
            style={{marginHorizontal: 30}}
          >
            Watch Live Stream
          </Button>
        )}
        {/* Uber Button */}
        {/* Checkin Block */}
        {/* Ratings Block */}
        <View style={[styles.floatingBlock, {width: floatingWidth}]}>
          {bar.reviews ? (
            Object.entries(bar.reviews || {}).map(item => {
              if (item[0] === 'count') return null
              return (
                <View key={item[0]} style={{flexDirection: 'row', flex: 0.5}}>
                  <Text category="p1" style={{fontWeight: 'bold'}}>
                    {item[0]?.slice(0, 1).toUpperCase()}
                    {item[0]?.slice(1, item[0].length)}:
                  </Text>
                  <Text
                    style={{color: theme['color-primary-500'], marginLeft: 8}}
                  >
                    {item[1] && Math.round(item[1])}
                  </Text>
                </View>
              )
            })
          ) : (
            <NoReviews barName={bar.barName} />
          )}
          {numStars && (
            <View
              style={{
                flexDirection: 'row',
                flex: 0.5,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text category="p1" style={{fontWeight: 'bold', marginRight: 8}}>
                OVERALL:
              </Text>
              <FlatList
                data={Array(numStars).fill(1)}
                renderItem={() => (
                  <Icon
                    name="star"
                    fill={theme['color-primary-600']}
                    style={styles.infoIcon}
                  />
                )}
                horizontal
              />
            </View>
          )}
          <Button onPress={navigateToReview}>Leave A Review</Button>
        </View>
      </ScrollView>
    </Layout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme['color-basic-200'],
    paddingVertical: 0,
  },
  lightText: {
    color: theme['color-basic-200'],
  },
  floatingBlock: {
    padding: 16,
    // Android Specific
    elevation: 5,
    // Ios Specific
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: {
      height: 0,
      width: 0,
    },

    borderWidth: 0,
    backgroundColor: theme['color-basic-100'],
    borderRadius: 4,
    margin: 16,
  },
  button: {},
  bannerImage: {
    flex: 1,
    height: 200,
    paddingBottom: 12,
  },
  left: {
    flex: 1,
    width: 100,
  },
  infoBlock: {
    flex: 0.3,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  infoIcon: {
    height: 24,
    width: 24,
    marginRight: 8,
  },
  infoItem: {
    flexDirection: 'row',
    height: 26,
    marginVertical: 4,
    elevation: 5,
  },
})

const NoReviews = ({barName}) => {
  return (
    <View style={{justifyContent: 'center', alignItems: 'center', height: 120}}>
      <Text
        category="p1"
        style={{textAlign: 'center'}}
      >{`${barName} has no reviews.\nYou can be the first!`}</Text>
    </View>
  )
}
