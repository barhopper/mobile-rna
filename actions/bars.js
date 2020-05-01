import {firestore, imageRef, geo} from '../services/firebase'
import {doWithLocation} from '../utils/permissions'
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

export function searchForBars(_keys, options, distance) {
  // Lets get the users location

  let barQuery = firestore.collection('Bars')

  // add all the query params
  options.forEach(opt => {
    barQuery = barQuery.where(opt, '==', true)
  })

  // This returns a promise that resolves to the return value of the function we pass
  let center = doWithLocation(loc => {
    const {
      coords: {latitude, longitude},
    } = loc
    return geo.point(latitude, longitude)
  })

  return new Promise((resolve, reject) => {
    center.then(userLocation => {
      const geoQuery = geo
        .query(barQuery)
        .within(userLocation, distance, 'position')

      get(geoQuery)
        .then(snapshot => {
          console.log(snapshot)
          const urlPromises = []
          //TODO this needs to add the url of the image in storage
          const bars = []
          snapshot.forEach(bar => {
            let urlPromise = null
            if (bar.barCoverImage) {
              urlPromise = imageRef.child(bar.barCoverImage).getDownloadURL()
            } else {
              urlPromise = imageRef.child('generic_bar_00.png').getDownloadURL()
            }

            urlPromises.push(Promise.resolve(urlPromise))

            urlPromise
              .then(url => {
                bar.imUrl = url
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
  })
}
