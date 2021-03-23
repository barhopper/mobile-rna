import { firestore, geo } from '../services/firebase'
import moment from 'moment'
import { get } from 'geofirex'

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

  // eslint-disable-next-line no-unused-vars
  let timeslot = getCurrentClosestTimeslot(slotModifier)

  const promotions = []
  let bars = []
  const snapshot = await get(
    geo.query(barsRef).within(position, distance, 'position', { units: 'mi' }),
  )
  snapshot.forEach(doc => {
    bars.push(doc)
  })
  await Promise.all(
    bars.map(async bar => {
      const promotionsQuery = await promotionRef
        .where('barId', '==', bar.id)
        .get()
      promotionsQuery.forEach(pr => {
        const startTime = moment(pr.data().promotionStartingHours, 'HH:mm');
        // const endTime = moment(moment().format('YYYY-MM-DD') + ' ' + pr.data().promotionEndingHours + '+0000');
        var startTimeSlot;
        if (startTime.minute() > 30 && startTime.minute() < 60) {
          var startTimeSlot = startTime.minute(30).second(0).format("h:mm A");
        } else {
          var startTimeSlot = startTime.minute(0).second(0).format("h:mm A");
        }
        const data = {
          bar,
          startTimeSlot,
          ...pr.data(),
          ...bar.hitMetadata,
        }
        promotions.push(data)
      })
    }),
  )
  const promotionsToReturn = promotions
    .filter(p => {
      const start = moment(
        p.promotionDays + ' ' + p.promotionStartingHours + '+0000',
      ).subtract(30, 'months')
      const nowString =
        moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm') + '+0000'
      const now = moment(nowString)
      const end = moment(
        p.promotionDays + ' ' + p.promotionEndingHours + '+0000',
      ).add(30, 'months')
      const filter = now.isAfter(start) && end.isAfter(now)
      return filter
    })
    .sort((a, b) => moment(a.promotionDays + ' ' + a.promotionStartingHours, 'YYYY-MM-DD HH:mm') - moment(b.promotionDays + ' ' + b.promotionStartingHours, 'YYYY-MM-DD HH:mm'))

  return promotionsToReturn
}
