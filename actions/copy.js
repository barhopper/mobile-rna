import {firestore} from '../services/firebase'

const copyRef = firestore.collection('Copy')

export function getTerms() {
  return new Promise((resolve, reject) => {
    copyRef
      .doc('terms')
      .get()
      .then(snapshot => {
        resolve(snapshot.data())
      })
      .catch(reject)
  })
}

export function getPrivacyPolicy() {
  return new Promise((resolve, reject) => {
    copyRef
      .doc('privacy')
      .get()
      .then(snapshot => {
        resolve(snapshot.data())
      })
      .catch(reject)
  })
}

export function getAbout() {
  return new Promise((resolve, reject) => {
    copyRef
      .doc('about')
      .get()
      .then(snapshot => {
        resolve(snapshot.data())
      })
      .catch(reject)
  })
}
