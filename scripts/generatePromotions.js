const admin = require('firebase-admin')
const moment = require('moment')
const faker = require('faker')

const debug = (...args) => {
  // eslint-disable-next-line no-constant-condition
  if (true) {
    // simple debug just flip this to true or false
    console.log(...args)
  }
}

// Need to set env var for GOOGLE_APPLICATION_CREDENTIALS to use
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://barhopper-269017.firebaseio.com',
})

const db = admin.firestore()

async function addPromotions() {
  let barsSnapshot = await db.collection('Bars').get()

  const promotions = []

  barsSnapshot.forEach(doc => {
    const bar = doc.data()
    bar.id = doc.id

    debug('******************* BAR **********************')
    debug(bar)
    debug('******************* PROMOTIONS **********************')
    let numPromotions = Math.round(Math.random() * 10)
    for (let i = 0; i < numPromotions; i++) {
      let promos = generatePromotion(bar)
      debug(promos)
      promotions.push(...promos)
    }
  })

  const batchWrite = db.batch()
  const promoRef = db.collection('Promotions')

  for (const promotion of promotions) {
    const docRef = promoRef.doc()
    batchWrite.create(docRef, promotion)
  }

  batchWrite.commit().then(() => console.log('Success'))
}

function generatePromotion(bar) {
  let fakeCurrentTime = getCurrentClosestTimeslot()
    .add(...getRandomTime({withNeg: true}))
    .toDate()

  let timePosted = moment(fakeCurrentTime)
    .add(...getRandomTime({withNeg: true}))
    .toDate()

  let slots = []

  let activeSlots = getRandomTime()[0] / 30
  let word = faker.random.word()
  let name = faker.name.firstName()
  let promoId = generateId()

  for (let i = 0; i < activeSlots; i++) {
    const promotion = {
      position: bar.position,
      barName: bar.barName,
      barId: bar.id,
      timeslot: moment(timePosted)
        .add(i * 30, 'm')
        .toDate(),
      text: `Issa promotion we're giving out free ${word} if your name is ${name}`,
      promoId,
    }

    slots.push(promotion)
  }

  return slots
}

function getCurrentClosestTimeslot() {
  const time = moment(Date.now())
  let mins = time.minutes()

  if (mins - 30 > 0) {
    time.minutes(30)
  } else {
    time.minutes(0)
  }

  time.seconds(0)
  time.milliseconds(0)
  return time
}

function getRandomTime(options = {withNeg: false}) {
  const {withNeg} = options

  let num = Math.random() * 100
  let neg = false

  let res = [60, 'm']
  if (num < 20) {
    res = [30, 'm']
  } else if (num < 40) {
    res = [60, 'm']
  } else if (num < 60) {
    res = [90, 'm']
  } else if (num < 80) {
    res = [120, 'm']
  } else if (num < 90) {
    res = [150, 'm']
  } else if (num <= 100) {
    res = [180, 'm']
  }

  if (withNeg) neg = Math.random() > 0.5 ? true : false
  if (neg) res[0] = 0 - res[0]
  return res
}

// This is a copy o the id generation function from the firestore source
const generateId = () => {
  // Alphanumeric characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let autoId = ''
  for (let i = 0; i < 20; i++) {
    autoId += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return autoId
}

addPromotions()
