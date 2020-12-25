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
  console.log('TimeSlot', timeslot)

  const promotions = []
  let bars = []
  const snapshot = await get(
    geo.query(barsRef).within(position, distance, 'position', {units: 'mi'}),
  )
  snapshot.forEach(doc => {
    console.log('Bar', doc)
    bars.push(doc)
  })
  await Promise.all(
    bars.map(async bar => {
      console.log('BarId', bar.id)
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
  console.log('Promotions', promotions)
  return promotions.filter(p => {
    console.log('Promotion', p)
    const start = moment(
      p.promotionDays + ' ' + p.promotionStartingHours + '+0000',
    )
    console.log('start', start)
    const nowString =
      moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm') + '+0000'
    console.log(nowString)
    const now = moment(nowString)
    console.log('now', now)
    const end = moment(p.promotionDays + ' ' + p.promotionEndingHours + '+0000')
    console.log('end', end)

    console.log('started', now.isAfter(start))
    console.log('ended', end.isAfter(now))
    const filter = now.isAfter(start) && end.isAfter(now)
    console.log('Filter', filter)
    return filter
  })
}
