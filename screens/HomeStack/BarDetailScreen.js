import {
  default as React,
  useLayoutEffect,
  useState,
  useEffect,
  useReducer,
} from 'react'
import {
  StyleSheet,
  View,
  Dimensions,
  ImageBackground,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native'
import {
  Layout,
  Card,
  Modal,
  Text,
  Icon,
  Button,
  Spinner,
  Radio,
  RadioGroup,
} from '@ui-kitten/components'
import {WebView} from 'react-native-webview'
// import {queryCache} from 'react-query'
import {imageRef} from '../../services/firebase'

import {default as theme} from '../../constants/Theme'
import {TouchableOpacity} from 'react-native-gesture-handler'
import {useQuery, queryCache, useMutation} from 'react-query'
import {
  getBar,
  getCheckinsForBar,
  submitCheckin,
  submitCheckout,
} from '../../actions/bars'
import {toggleFavorite} from '../../actions/favorites'
import {useUser} from '../../contexts/userContext'

export default function BarDetailScreen({route, navigation, checkin}) {
  const {bar: _bar} = route.params || {bar: {hitMetadata: {distance: 0}}}
  const {
    hitMetadata: {distance},
  } = _bar?.hitMetadata ? _bar : {hitMetadata: {distance: 0}}

  // eslint-disable-next-line no-unused-vars
  const {error, status, data: bar, isFetching} = useQuery(
    ['bar', _bar.id],
    getBar,
    {
      initialData: _bar,
    },
  )

  const user = useUser()
  const [checkins, setCheckins] = useState()
  getCheckinsForBar(_bar.id).then(data => {
    setCheckins()
    if (data.length > 0) {
      const female = data.filter(d => d.gender && d.gender === 'female')
      const femaleSingle = female.filter(f => f.status && f.status === 'single')

      const male = data.filter(d => d.gender && d.gender === 'male')
      const maleSingle = male.filter(m => m.status && m.status === 'single')

      const myCheckin = data.find(d => d.userId == user.uid)
      const unknownCheckin = data.length - female.length - male.length
      console.log(`My Checkin ${myCheckin.id}`)
      setCheckins({
        female,
        femaleSingle,
        male,
        maleSingle,
        myCheckin,
        unknownCheckin,
      })
    }
  })
  const userId = user?.uid

  const {width} = Dimensions.get('window')
  const fiftyPercent = width / 2
  const infoItemWidth = width - 60
  const floatingWidth = width - 30

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const reviewValues = Object.values(bar.reviews || {})
  const reviewTotal =
    reviewValues.reduce((acc, cur) => acc + (cur - 0), 0) - bar.reviews?.count
  const avgReview = reviewTotal > 0 && reviewTotal / (reviewValues.length - 1)
  const numStars = avgReview && Math.round(avgReview / 2)

  // const maleValues = Object.values(bar.checkins || {})
  // const maleTotal =
  //   maleValues.reduce((acc, cur) => acc + (cur - 0), 0) + bar.checkins?.count

  // const femaleValues = Object.values(bar.checkins || {})
  // const femaleTotal =
  //   femaleValues.reduce((acc, cur) => acc + (cur - 0), 0) + bar.checkins?.count

  const favorites = queryCache.getQueryData(['favorites', userId])
  const favRecord = bar && favorites ? favorites[bar?.id || 'nothing'] : false
  const [selectedGender, setSelectedGender] = React.useState(0)
  const [selectedStatus, setSelectedStatus] = React.useState(0)

  let barHours = 'No Hours'
  if (bar.barOpeningHours && bar.barClosingHours) {
    barHours = `${bar.barOpeningHours} - ${bar.barClosingHours}`
  } else if (bar.barOpeningHours) {
    barHours = `open from ${bar.barOpeningHours}`
  } else if (bar.barClosingHours) {
    barHours = `open until ${bar.barClosingHours}`
  }

  // For the carousel we can use this to control what image we're seeing
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [carouselImages, setCarouselImages] = useState(
    bar.imgUrl ? [bar.imgUrl] : [],
  )

  const showLoader = isFetching && !bar.imgUrl && !bar.barImages

  const handleAddCheckin = () => {
    // if (user.isAnonymous) {
    //   return
    // }

    const submission = {
      barId: _bar.id,
      userId: user.uid,
      gender: selectedGender === 0 ? 'male' : 'female',
      status: selectedStatus === 0 ? 'single' : 'not single',
    }

    setIsSubmitting(true)
    submitCheckin({...submission})
      // eslint-disable-next-line no-unused-vars
      .then(bar => {
        Alert.alert('Success', 'Checkin successfull', [
          {
            text: 'OK',
            onPress: () => setVisible(false),
          },
        ])

        // TODO: Hook this as an update into reactQuery
      })
      .catch(err => {
        console.log(err)
        Alert.alert('Sorry', err.message || 'Something Went Wrong', [
          {
            text: 'OK',
            onPress: () => setVisible(false),
          },
        ])
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleCheckout = () => {
    setIsCheckingOut(true)
    console.log(checkins)
    submitCheckout(checkins.myCheckin.id)
      // eslint-disable-next-line no-unused-vars
      .then(bar => {
        Alert.alert('Success', 'Checkout successfull', [
          {
            text: 'OK',
          },
        ])
      })
      .catch(err => {
        console.log(err)
        Alert.alert('Sorry', err.message || 'Something Went Wrong', [
          {
            text: 'OK',
          },
        ])
      })
      .finally(() => {
        setIsCheckingOut(false)
      })
  }

  const [mutateFavorites] = useMutation(
    ({userId, bar, favRecord}) => toggleFavorite(userId, bar, favRecord),
    {
      // Optimistically update the cache value on mutate, but store
      // the old value and return it so that it's accessible in case of
      // an error
      onMutate: ({userId, bar, favRecord}) => {
        if (!bar || !userId) return
        const {id: barId, position, barName, barCoverImage, imgUrl} = bar
        const favorite = {
          barId,
          position,
          barName,
          barCoverImage,
          imgUrl,
          userId,
        }

        queryCache.cancelQueries(['favorites', userId])

        const previousValue = queryCache.getQueryData(['favorites', userId])

        queryCache.setQueryData(['favorites', userId], old => {
          // if the record exits this creates the same obj
          let tempFavs = {...old, [favorite.barId]: favorite}
          if (favRecord) delete tempFavs[favorite.barId]
          return tempFavs
        })

        return previousValue
      },

      // On failure, roll back to the previous value
      onError: (err, {userId}, previousValue) => {
        return previousValue
          ? queryCache.setQueryData(['favorites', userId], previousValue)
          : null
      },

      onSuccess: async (response, {userId, bar, favRecord}) => {
        let newFav = null
        if (!favRecord) {
          const favRes = await response.get()
          newFav = favRes.data()
          newFav.id = favRes.id
        }
        navigation.setOptions({
          headerRight: () => {
            return (
              <TouchableOpacity
                onPress={() =>
                  handleFavoritePress({userId, bar, favRecord: newFav})
                }
              >
                <Icon
                  name={`${!favRecord ? 'star' : 'star-outline'}`}
                  fill={
                    !favRecord
                      ? theme['color-basic-100']
                      : theme['color-primary-300']
                  }
                  style={[
                    styles.infoIcon,
                    {height: 32, width: 32, marginRight: 16},
                  ]}
                />
              </TouchableOpacity>
            )
          },
        })
      },
      // After success or failure, refetch the favorites query
      onSettled: () => queryCache.refetchQueries(['favorites', userId]),
    },
  )

  const handleFavoritePress = args => {
    if (user.isAnonymous) {
      Alert.alert('Sorry', 'You must create an account to add Favorites', [
        {text: 'Create Account', onPress: () => navigation.navigate('Profile')},
        {text: 'Cancel', onPress: () => {}},
      ])
      return
    }
    mutateFavorites(args)
  }

  const rotateRight = () => {
    setActiveImageIndex(current => (current + 1) % carouselImages.length)
  }

  const rotateLeft = () => {
    setActiveImageIndex(current => {
      let remainder = (current - 1) % carouselImages.length
      return remainder >= 0 ? remainder : remainder + carouselImages.length
    })
  }

  useLayoutEffect(() => {
    navigation.addListener('focus', () => {
      // do something
      navigation.setOptions({
        title: bar.barName || 'Bar Details',
        headerRight: () => (
          <TouchableOpacity
            onPress={() => handleFavoritePress({userId, bar, favRecord})}
          >
            <Icon
              name={`${favRecord ? 'star' : 'star-outline'}`}
              fill={
                favRecord
                  ? theme['color-basic-100']
                  : theme['color-primary-300']
              }
              style={[
                styles.infoIcon,
                {height: 32, width: 32, marginRight: 16},
              ]}
            />
          </TouchableOpacity>
        ),
      })

      if (!isFetching) queryCache.refetchQueries(['bar', _bar.id])
    })
  }, [navigation, bar, userId, favorites])

  useEffect(() => {
    if (bar.barImages && carouselImages.length !== bar.barImages.length) {
      let imgUrls = []

      let imgUrlPromises = bar.barImages.map(url => {
        return imageRef
          .child(`${bar.id}/${url}`)
          .getDownloadURL()
          .then(res => imgUrls.push(res))
          .catch(e => console.log('Error: ', e))
      })

      Promise.all(imgUrlPromises).then(() => {
        setCarouselImages(imgUrls)
      })
    } else if (!bar.imgUrl || bar.fromFav) {
      // we can assume if we don't have an imgURl we need to fetch the bar
      if (!isFetching)
        queryCache.refetchQueries(['bar', _bar.id], {force: true})
    }
  }, [bar])

  useEffect(() => {
    setActiveImageIndex(0)
  }, [carouselImages])

  const navigateToReview = () => {
    navigation.navigate('review', {barId: bar.id})
  }

  const safeUrl = url => {
    let _url = ''
    if (!url) return
    _url = typeof url !== 'string' ? url.toString() : url
    _url = _url.match(/http(s)?:\/\//) ? _url : `https://${_url}`
    return _url
  }
  const [visible, setVisible] = React.useState(false)

  if (status === 'error') return null

  const [checkinState, checkinDispatch] = useReducer(
    checkinInfoReducer,
    emptyCheckinState,
    checkinInfoInit,
  )

  useEffect(() => {
    checkinDispatch({type: 'reset', payload: checkin || emptyCheckinState})
  }, [checkin])

  const handleInputChange = event => {
    checkinDispatch({
      type: 'update',
      payload: {
        name: event.target.name,
        value: event.target.value,
      },
    })
  }

  return (
    <Layout style={styles.container}>
      <ScrollView style={{flex: 1}}>
        {/* Carousel */}
        <ImageBackground
          style={styles.bannerImage}
          imageStyle={{resizeMode: 'cover'}}
          source={{uri: carouselImages[activeImageIndex] || bar.imgUrl || null}}
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
            {!showLoader ? (
              carouselImages.map((img, index) => {
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
                            index === activeImageIndex
                              ? 'color-primary-200'
                              : 'color-basic-100'
                          }`
                        ],
                      marginHorizontal: 8,
                    }}
                    onPress={() => setActiveImageIndex(index)}
                  ></TouchableOpacity>
                )
              })
            ) : (
              <Spinner size="giant" />
            )}
          </View>
        </ImageBackground>

        <Layout style={styles.buttonCheck} level="1">
          {checkins && checkins.myCheckin ? (
            <Button
              onPress={!isCheckingOut ? handleCheckout : () => {}}
              style={[
                {
                  margin: 10,
                  backgroundColor: '#C42D3E',
                  borderColor: '#C42D3E',
                  width: '100%',
                },
              ]}
            >
              {isCheckingOut ? (
                <Spinner status="basic" size="small" />
              ) : (
                'Check-Out'
              )}
            </Button>
          ) : (
            <Button
              onPress={() => setVisible(true)}
              style={[
                {
                  margin: 10,
                  backgroundColor: '#299334',
                  borderColor: '#299334',
                  width: '100%',
                },
              ]}
            >
              Check-In
            </Button>
          )}
          <Modal
            visible={visible}
            backdropStyle={styles.backdrop}
            onBackdropPress={() => setVisible(false)}
          >
            <Card disabled={true}>
              <View
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{textAlign: 'center', fontWeight: '700'}}
                  category="h4"
                >
                  Check-in to {bar.barName}
                </Text>
              </View>

              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 200,
                }}
              >
                <Text category="h6">{`Please Select Gender:`}</Text>

                <RadioGroup
                  selectedIndex={selectedGender}
                  onChange={index => setSelectedGender(index)}
                >
                  <Radio
                    style={styles.radio}
                    label="Male"
                    name="gender"
                    fullWidth
                    value={checkinState.male}
                    onChange={handleInputChange}
                  >
                    Male
                  </Radio>

                  <Radio
                    style={styles.radio}
                    label="Female"
                    name="gender"
                    fullWidth
                    value={checkinState.female}
                    onChange={handleInputChange}
                  >
                    Female
                  </Radio>
                </RadioGroup>
              </View>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 50,
                }}
              >
                <Text category="h6">{`Please Select Status:`}</Text>
                <RadioGroup
                  selectedIndex={selectedStatus}
                  onChange={index => setSelectedStatus(index)}
                >
                  <Radio
                    style={styles.radio}
                    label="Single"
                    name="status"
                    fullWidth
                    value={checkinState.single}
                    onChange={handleInputChange}
                  >
                    Single
                  </Radio>
                  <Radio
                    style={styles.radio}
                    label="Not Single"
                    name="status"
                    fullWidth
                    value={checkinState.notSingle}
                    onChange={handleInputChange}
                  >
                    Not Single
                  </Radio>
                </RadioGroup>
              </View>

              <Button
                onPress={!isSubmitting ? handleAddCheckin : () => {}}
                style={[
                  {
                    marginTop: 50,
                    marginBottom: 20,
                    backgroundColor: '#299334',
                    borderColor: '#299334',
                  },
                ]}
              >
                {isSubmitting ? (
                  <Spinner status="basic" size="small" />
                ) : (
                  'CHECK-IN'
                )}
              </Button>
              <Button onPress={() => setVisible(false)}>
                {' '}
                {/* Used to close the url from WebView component */}
                SKIP
              </Button>
            </Card>
          </Modal>
        </Layout>

        {/* Info block with quick data points */}
        <View style={styles.infoBlock}>
          <View
            style={[
              styles.infoItem,
              {maxWidth: infoItemWidth, minWidth: infoItemWidth / 2},
            ]}
          >
            <Icon
              name="paper-plane"
              fill={theme['color-primary-600']}
              style={styles.infoIcon}
            />
            <Text>{distance.toFixed(2)} Mi.</Text>
          </View>
          <View
            style={[
              styles.infoItem,
              {maxWidth: infoItemWidth, minWidth: infoItemWidth / 2},
            ]}
          >
            <Icon
              name="pin"
              fill={theme['color-primary-600']}
              style={styles.infoIcon}
            />
            <Text>{bar?.barAddress || 'No Address'}</Text>
          </View>
          <View
            style={[
              styles.infoItem,
              {maxWidth: infoItemWidth, minWidth: infoItemWidth / 2},
            ]}
          >
            <Icon
              name="smartphone-outline"
              fill={theme['color-primary-600']}
              style={styles.infoIcon}
            />
            <Text>{bar?.barPhone || 'No Phone Number'}</Text>
          </View>
          <View
            style={[
              styles.infoItem,
              {maxWidth: infoItemWidth, minWidth: infoItemWidth / 2},
            ]}
          >
            <Icon
              name="globe-outline"
              fill={theme['color-primary-600']}
              style={styles.infoIcon}
            />
            <Text>{bar.barUrl || 'No Website'}</Text>
          </View>
          <View
            style={[
              styles.infoItem,
              {maxWidth: infoItemWidth, minWidth: infoItemWidth / 2},
            ]}
          >
            <Icon
              name="calendar-outline"
              fill={theme['color-primary-600']}
              style={styles.infoIcon}
            />
            <Text>{bar.barOpenDays || 'No Days'}</Text>
          </View>
          <View
            style={[
              styles.infoItem,
              {maxWidth: infoItemWidth, minWidth: infoItemWidth / 2},
            ]}
          >
            <Icon
              name="clock-outline"
              fill={theme['color-primary-600']}
              style={styles.infoIcon}
            />
            <Text>{barHours}</Text>
          </View>
        </View>

        {/* Live Stream Button */}
        {bar?.liveUrl ? (
          <Layout style={styles.button} level="1">
            <Button onPress={() => setVisible(true)}>Watch Live Stream</Button>

            <Modal
              visible={visible}
              backdropStyle={styles.backdrop}
              onBackdropPress={() => setVisible(false)}
            >
              <Card disabled={true}>
                <View>
                  <WebView
                    useWebKit={true}
                    originWhitelist={['*']}
                    style={{flex: 1}}
                    javaScriptEnabled={true}
                    source={{uri: safeUrl(bar?.liveUrl)}}
                    isLooping
                    shouldPlay
                  />
                </View>
                <Button onPress={() => setVisible(false)}>
                  {' '}
                  {/* Used to close the url from WebView component */}
                  DISMISS
                </Button>
              </Card>
            </Modal>
          </Layout>
        ) : null}

        {/* Uber Button */}

        {/* Check-In Block */}
        <View style={[styles.floatingBlock, {width: floatingWidth}]}>
          {checkins ? (
            <>
              {checkins.female && checkins.female.length > 0 && (
                <Text category="p1">
                  <Text style={{color: theme['color-danger-500']}}>
                    {checkins.female.length}
                  </Text>{' '}
                  Females checked in{' '}
                  <Text style={{color: theme['color-danger-500']}}>
                    {checkins.femaleSingle.length}
                  </Text>
                  Singles
                </Text>
              )}
              {checkins.male && checkins.male.length > 0 && (
                <Text category="p1">
                  <Text style={{color: theme['color-danger-500']}}>
                    {checkins.male.length}
                  </Text>{' '}
                  Males checked in{' '}
                  <Text style={{color: theme['color-danger-500']}}>
                    {checkins.maleSingle.length}
                  </Text>
                  Singles
                </Text>
              )}
              {checkins.unknownCheckin && checkins.unknownCheckin > 0 && (
                <Text category="p1">
                  <Text style={{color: theme['color-danger-500']}}>
                    {checkins.unknownCheckin}
                  </Text>{' '}
                  other people checked in.
                </Text>
              )}
            </>
          ) : (
            <NoCheckin barName={bar.barName} />
          )}
        </View>

        {/* Ratings Block */}
        <View style={[styles.floatingBlock, {width: floatingWidth}]}>
          {bar.reviews ? (
            Object.entries(bar.reviews || {}).map(item => {
              if (item[0] === 'count') return null
              return (
                <View key={item} style={{flexDirection: 'row', flex: 0.5}}>
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

          {numStars || numStars === 0 ? (
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
                horizontal
                data={Array(numStars).fill(1)}
                renderItem={(_item, index) => (
                  <Icon
                    key={_item + '' + index}
                    name="star"
                    fill={theme['color-primary-600']}
                    style={styles.infoIcon}
                  />
                )}
              />
            </View>
          ) : null}

          <Button onPress={navigateToReview}>Leave A Review</Button>
        </View>
      </ScrollView>
    </Layout>
  )
}

const emptyCheckinState = {
  male: '',
  female: '',
  single: '',
  notSingle: '',
}

function checkinInfoInit(checkinInfo) {
  return {
    original: checkinInfo,
    ...checkinInfo,
    hasChanged: false,
  }
}

function checkinInfoReducer(state, action) {
  const {type, payload} = action
  let hasChanged = false
  switch (type) {
    case 'reset':
      return checkinInfoInit(payload || state.original)
    case 'update':
      hasChanged = true
      return {
        ...state,
        [payload.name]: payload.value,
        hasChanged,
      }
    default:
      return state
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme['color-basic-200'],
    paddingVertical: 0,
  },

  containerPicker: {
    flex: 5,
    alignItems: 'center',
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
  button: {
    width: '50%',
    alignSelf: 'center',
    margin: 10,
  },

  buttonCheck: {
    flexDirection: 'row',
    width: '94%',
    backgroundColor: theme['color-basic-300'],
  },

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
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 16,
  },
  infoIcon: {
    height: 24,
    width: 24,
    marginRight: 8,
  },
  infoItem: {
    flexDirection: 'row',
    minHeight: 26,
    marginVertical: 4,
    marginRight: 14,
  },

  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  radio: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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

const NoCheckin = ({barName}) => {
  return (
    <View style={{justifyContent: 'center', alignItems: 'center', height: 120}}>
      <Text
        category="p1"
        style={{textAlign: 'center'}}
      >{`${barName} has no check-ins.`}</Text>
    </View>
  )
}

// function measureHeightAsync(component) {
//   return new Promise(resolve => {
//     component.measure((x, y, w, h) => {
//       resolve(h)
//     })
//   })
// }
