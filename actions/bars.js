import {firestore, imageRef} from '../services/firebase'

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

export function searchForBars(_keys, options) {
  console.log('Looking for bars with: ', options)
  let barQuery = firestore.collection('Bars')

  // add all the query params
  options.forEach(opt => {
    barQuery = barQuery.where(opt, '==', true)
  })

  return new Promise((resolve, reject) => {
    barQuery
      .get()
      .then(snapshot => {
        // console.log(snapshot)
        const urlPromises = []
        //TODO this needs to add the url of the image in storage
        const bars = []
        snapshot.forEach(doc => {
          const bar = doc.data()
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
}
