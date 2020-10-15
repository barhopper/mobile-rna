import {firestore, geo} from '../services/firebase'
import {get} from 'geofirex'
import moment from 'moment'

function getCurrentClosestTimeslot(modifier = 0) {
  const time = moment(Date.now())
  let mins = time.minutes()

  if (mins - 30 > 0) {
    time.minutes(30)
  } else {
    time.minutes(0)
  }

  time.seconds(0)
  time.milliseconds(0)
  return time.add(30 * modifier, 'm')
}

export function searchForPromotions(_keys, distance, position, options = {}) {
  let slotModifier = 0
  // Lets get the users location
  if (!distance || !position) {
    return Promise.resolve([])
  }

  if (options.slotModifier) {
    slotModifier = options.slotModifier
  }

  position = geo.point(...position)

  let timeslot = getCurrentClosestTimeslot(slotModifier)

  const queryRef = firestore
    .collection('Promotions')
    .where('timeslot', '==', timeslot.toDate())

  const geoQuery = geo
    .collection('Bars')
    .query(queryRef)
    .within(position, distance, 'position', {units: 'mi'})
  console.log(get(geoQuery))
  return get(geoQuery)
}
