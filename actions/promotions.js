import {firestore, geo} from '../services/firebase'
import moment from 'moment'

const barsRef = firestore.collection('Bars')
const promotionRef = firestore.collection('Promotions')

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

  const promotions = []
  barsRef.get().then(snapshot => {
    promotionRef
      .doc(snapshot.data().promoId)
      .where('timeslot', '==', timeslot.toDate())
      .get()
      .then(promotion => {
        promotions.push(promotion)
      })
  })
}
