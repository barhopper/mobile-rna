/* eslint-disable no-unused-vars */
/**
 * Everything im here should return a promise to be used by react-query
 */
import {firestore} from '../services/firebase'
import {AsyncStorage} from 'react-native'
import {auth, EmailAuthProvider, profileImageRef} from '../services/firebase'

export const USER_STORAGE_KEY = 'user'

/**
 * storeAfterResolve
 * returns a function that takes a promise, stores the result of that promise
 * in async storage as key or throws error
 *
 * returns a promise to be compatible with redux-query
 * @param {String} key
 */
function storeAfterResolve(key) {
  return function (promise) {
    return new Promise((resolve, reject) => {
      Promise.resolve(promise)
        .then(value => {
          AsyncStorage.setItem(key, JSON.stringify(value?.user)).then(() => {
            resolve(value?.user)
          })
        })
        .catch(reject)
    })
  }
}

const storeResolvedUser = storeAfterResolve(USER_STORAGE_KEY)

export function signUp(_key, email, password) {
  return storeResolvedUser(auth.createUserWithEmailAndPassword(email, password))
}

export function signIn(_key, email, password) {
  return storeResolvedUser(auth.signInWithEmailAndPassword(email, password))
}

export function SignInAnonymous(_key) {
  return storeResolvedUser(auth.signInAnonymously())
}

export function createAccountFromAnonymous(email, password) {
  const {currentUser} = auth
  const credential = EmailAuthProvider.credential(email, password)
  return storeResolvedUser(currentUser.linkWithCredential(credential))
}

export function signOut(doAfterSignOut) {
  try {
    auth.signOut()
  } catch (e) {
    // we don't need to handle this if it fails
  }

  if (typeof doAfterSignOut === 'function') {
    doAfterSignOut()
  }
  return storeResolvedUser(Promise.resolve(null))
}

export async function changePassword(password, newPassword) {
  const {currentUser} = auth

  try {
    await auth.signInWithEmailAndPassword(currentUser.email, password)
    await currentUser.updatePassword(newPassword)
    return Promise.resolve()
  } catch (e) {
    return Promise.reject(e)
  }
}

export function resetPassword(email) {
  return Promise.reject('This is just a stub')
}

export async function addLocation(location) {
  const {currentUser} = auth
  let hasData = false
  console.log(currentUser.uid)
  let oldData = await firestore
    .collection('Locations')
    .where('userId', '==', currentUser.uid)
    .get()
  console.log(oldData)
  if (!oldData.empty) {
    hasData = true
  }
  console.log('Has Data', hasData)
  firestore
    .collection('Locations')
    .doc(hasData ? oldData.docs[0].id : generateId())
    .set({
      userId: currentUser.uid,
      ...location,
    })
}

export async function changeUserImageAsync(image) {
  if (!image?.uri) return

  const {currentUser} = auth
  const isFirstPhoto = !currentUser.photoURL
  const {uid} = currentUser
  const fileName = `${uid}.${image.uri.split('.').pop()}`

  const fetchResponse = await fetch(image.uri)
  const imageBlob = await fetchResponse.blob()

  const uploadTask = await profileImageRef.child(fileName).put(imageBlob)
  const finalUrl = await uploadTask.ref.getDownloadURL()

  if (isFirstPhoto) {
    await currentUser.updateProfile({
      photoURL: finalUrl,
    })
  }

  return Promise.resolve(finalUrl)
}

/**
 * getItemFromStorage
 * Async function that retrieves data from local storage or null if it doesn't exist
 * returns a promise that resolves to the data stored with key
 * @param {String} key
 */
function getItemFromStorage(key) {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(key)
      .then(data => {
        resolve(data ? JSON.parse(data) : null)
      })
      .catch(reject)
  })
}
/**
 * returns the current users information from
 */
export function getCurrentUserFromStorage() {
  return getItemFromStorage(USER_STORAGE_KEY)
}

export const generateId = () => {
  // Alphanumeric characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let autoId = ''
  for (let i = 0; i < 20; i++) {
    autoId += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return autoId
}
