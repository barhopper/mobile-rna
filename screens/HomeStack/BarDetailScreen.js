import {default as React} from 'react'
import {
  StyleSheet,
  View,
  Dimensions,
  ImageBackground,
  ScrollView,
  FlatList,
} from 'react-native'
import {Layout, Text, Icon, Button} from '@ui-kitten/components'

// import {queryCache} from 'react-query'

import {default as theme} from '../../constants/Theme'

export default function BarDetailScreen({route, navigation}) {
  const {bar} = route.params || {bar: {hitMetadata: {}}}
  const {
    hitMetadata: {distance},
  } = bar

  // const categories = queryCache.getQuery('categories')?.state.data
  // const allCategories = Object.values(categories || {}).reduce(
  //   (acc, cur) => acc.concat(cur),
  //   [],
  // )
  // const barCategories = allCategories?.filter(cat => {
  //   return bar[cat]
  // })

  const {width} = Dimensions.get('window')
  const infoItemWidth = width / 2 - 30
  const floatingWidth = width - 30

  const reviewValues = Object.values(bar.reviews || {})
  const reviewTotal =
    reviewValues.reduce((acc, cur) => acc + (cur - 0), 0) - bar.reviews?.count
  const avgReview = reviewTotal > 0 && reviewTotal / (reviewValues.length - 1)
  const numStars = avgReview && avgReview / 2

  // For the carousel we can use this to control what image we're seeing
  // const [bannerImage, setBannerImage] = useState(bar.imgUrl)

  const leaveReview = () => {
    navigation.navigate('review')
  }

  return (
    <Layout style={styles.container}>
      <ScrollView style={{flex: 1}}>
        {/* Carousel */}
        <ImageBackground
          style={styles.bannerImage}
          imageStyle={{resizeMode: 'cover'}}
          source={{uri: bar.imgUrl}}
        >
          <Text category="h6" style={styles.lightText}>
            {bar.barName}
          </Text>
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
            <Text>3:00pm - 10:00pm</Text>
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
            <Text>Daily</Text>
          </View>
        </View>
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
                    {item[1]}
                  </Text>
                </View>
              )
            })
          ) : (
            <Text>This bar has no reviews</Text>
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
                renderItem={num => (
                  <Icon
                    key={num}
                    name="star"
                    fill={theme['color-primary-600']}
                    style={styles.infoIcon}
                  />
                )}
                horizontal
              />
            </View>
          )}
          <Button onPress={leaveReview}>Leave A Review</Button>
        </View>
        {/* Live Stream Button */}
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
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 16,
    height: 200,
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
