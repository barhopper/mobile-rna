import {firestore, imageRef, geo, functions} from '../services/firebase'
import {get} from 'geofirex'

export function getCategories() {
  return new Promise((resolve, reject) => {
    const data = {}
    firestore
      .collection('Categories')
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          let key = doc.get('categoryName')
          data[key] = doc.get('subcategories')
        })
        resolve(data)
      })
      .catch(reject)
  })
}

export function searchForBars(_keys, distance, position) {
  // Lets get the users location
  // console.log('Fetching Bars', distance, position)
  if (!distance || !position) {
    return Promise.resolve([])
  }

  position = geo.point(...position)

  return new Promise((resolve, reject) => {
    const geoQuery = geo
      .query('Bars')
      .within(position, distance, 'position', {units: 'mi'})

    get(geoQuery)
      .then(results => {
        const urlPromises = []
        //TODO this needs to add the url of the image in storage
        const bars = []
        results.forEach(bar => {
          let urlPromise = null
          if (bar.barCoverImage) {
            urlPromise = imageRef
              .child(`${bar.id}/${bar.barCoverImage}`)
              .getDownloadURL()
          } else {
            urlPromise = imageRef
              .child('public/generic_bar_00.png')
              .getDownloadURL()
          }

          urlPromises.push(Promise.resolve(urlPromise))

          urlPromise
            .then(url => {
              bar.imgUrl = url
            })
            .catch(() => {
              // Do nothing for now, we need a default image with public url to put here
              return null
            })

          bars.push(bar)
        })

        // when we have urls for all the images then we can resolve
        Promise.all(urlPromises)
          .then(() => {
            resolve(bars)
          })
          .catch(() => {
            resolve(bars)
          })
      })
      .catch(reject)
  })
}

export async function getBar(_key, barId) {
  try {
    const barSnapshot = await firestore.collection('Bars').doc(barId).get()

    if (barSnapshot.exists) {
      let barData = barSnapshot.data()
      let imgPromise = null

      if (barData.barCoverImage) {
        imgPromise = await imageRef
          .child(`${barSnapshot.id}/${barData.barCoverImage}`)
          .getDownloadURL()
      } else {
        imgPromise = await imageRef
          .child('public/generic_bar_00.png')
          .getDownloadURL()
      }

      barData.imgUrl = imgPromise
      barData.id = barId
      return Promise.resolve(barData)
    }

    throw new Error('Bar does not exist')
  } catch (e) {
    return Promise.reject(e)
  }
}

export function getQuestions() {
  return new Promise((resolve, reject) => {
    const data = []
    firestore
      .collection('Questions')
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const question = doc.data()
          question.id = doc.id
          data.push(question)
        })
        resolve(data)
      })
      .catch(reject)
  })
}

export function submitReview(reviewData) {
  const addReview = functions.httpsCallable('addReview')
  return addReview(reviewData).then(console.log)
}
