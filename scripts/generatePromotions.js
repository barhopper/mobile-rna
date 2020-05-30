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
      let promo = generatePromotion(bar)
      debug(promo)
      promotions.push(promo)
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
  let currentTime = Date.now()
  let fakeCurrentTime = moment(currentTime)
    .add(...getRandomTime({withNeg: true}))
    .toDate()

  let timePosted = moment(fakeCurrentTime)
    .add(...getRandomTime({withNeg: true}))
    .toDate()

  const promotion = {
    position: bar.position,
    barName: bar.barName,
    barId: bar.id,
    postedTime: timePosted,
    expires: moment(timePosted)
      .add(...getRandomTime())
      .toDate(),
    text: `Issa promotion we're giving out free ${faker.random.word()} if your name is ${faker.name.firstName()}`,
  }

  return promotion
}

function getRandomTime(options = {withNeg: false}) {
  const {withNeg} = options

  let num = Math.random() * 100
  let neg = false

  let res = [60, 'm']
  if (num < 10) {
    res = [10, 'm']
  } else if (num < 20) {
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

addPromotions()
