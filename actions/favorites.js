import {firestore} from '../services/firebase'

export function getFavorites(_key, userId) {
  return new Promise((resolve, reject) => {
    firestore
      .collection('Favorites')
      .where('userId', '==', userId)
      .get()
      .then(snapshot => {
        const data = {}
        snapshot.forEach(doc => {
          let key = doc.get('barId')
          data[key] = doc.data()
          data[key].id = doc.id
        })
        resolve(data)
      })
      .catch(reject)
  })
}

export function toggleFavorite(userId, bar, favoriteRecord) {
  // Check for userId and bar and reject if bad
  // build favorite from the data we got

  if (!userId || !bar?.id) {
    return Promise.reject(`Invalid ${userId ? 'bar' : 'user'} id`)
  }

  console.log({favoriteRecord})
  if (favoriteRecord) {
    return new Promise((resolve, reject) => {
      // this resolves a document reference that we can then .get()
      firestore
        .collection('Favorites')
        .doc(favoriteRecord.id)
        .delete()
        .then(resolve)
        .catch(reject)
      // resolve(favorite)
    })
  } else {
    const {id: barId, position, barName, barCoverImage, imgUrl} = bar
    const favorite = {
      barId,
      position,
      barName,
      barCoverImage,
      userId,
      imgUrl,
    }

    // we handle adding we need to handle removing

    return new Promise((resolve, reject) => {
      // this resolves a document reference that we can then .get()
      firestore
        .collection('Favorites')
        .add(favorite)
        .then(resolve)
        .catch(reject)
      // resolve(favorite)
    })
  }
}
