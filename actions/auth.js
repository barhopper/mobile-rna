/* eslint-disable no-unused-vars */
/**
 * Everything im here should return a promise to be used by react-query
 */
import {AsyncStorage} from 'react-native'
import {auth} from '../services/firebase'

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
          AsyncStorage.setItem(key, JSON.stringify(value)).then(() => {
            resolve(value)
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

export function signOut(doAfterSignOut) {
  console.log('Signing out')
  auth.signOut()
  if (typeof doAfterSignOut === 'function') {
    doAfterSignOut()
  }
  return storeResolvedUser(Promise.resolve(null))
}

export function changePassword(newPassword) {
  return Promise.reject('This is just a stub')
}

export function resetPassword(email) {
  return Promise.reject('This is just a stub')
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
