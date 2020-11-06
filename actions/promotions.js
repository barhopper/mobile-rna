import {firestore, geo} from '../services/firebase'
import moment from 'moment'
import {get} from 'geofirex'

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

export async function searchForPromotions(
  _keys,
  distance,
  position,
  options = {},
) {
  let slotModifier = 0
  // Lets get the users location
  if (!distance || !position) {
    return Promise.resolve([])
  }

  if (options.slotModifier) {
    slotModifier = options.slotModifier
  }

  position = geo.point(...position)
  console.log('Position', position)

  // eslint-disable-next-line no-unused-vars
  let timeslot = getCurrentClosestTimeslot(slotModifier)
  console.log(timeslot)

  const promotions = []
  let bars = []
  const snapshot = await get(
    geo.query(barsRef).within(position, 3000, 'position', {units: 'mi'}),
  )
  snapshot.forEach(doc => {
    console.log('Bar', doc)
    bars.push(doc)
  })
  await Promise.all(
    bars.map(async bar => {
      const promotionsQuery = await promotionRef
        .where('barId', '==', bar.id)
        .get()
      promotionsQuery.forEach(pr => {
        const data = {
          ...pr.data(),
          ...bar.hitMetadata,
        }
        console.log('promotions', data)
        promotions.push(data)
      })
    }),
  )
  return promotions
}
