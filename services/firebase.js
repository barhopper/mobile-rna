import * as firebase from 'firebase'
import * as geofirex from 'geofirex'

import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'
import 'firebase/functions'

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyCP8g7WmQG7huPShFT7jSeIwIiHTkJCedE',
  authDomain: 'barhopper-269017.firebaseapp.com',
  databaseURL: 'https://barhopper-269017.firebaseio.com',
  projectId: 'barhopper-269017',
  storageBucket: 'barhopper-269017.appspot.com',
  messagingSenderId: '655167498507',
  appId: '1:655167498507:web:7ba8e361bfbb5b3f915a0e',
  measurementId: 'G-1DRDEHW79G',
}

export const fbApp = firebase.initializeApp(firebaseConfig)

export const auth = firebase.auth()

export const firestore = firebase.firestore()

export const storage = firebase.storage()
export const imageRef = storage.ref('images/')

export const geo = geofirex.init(firebase)

export const functions = firebase.functions()

export const EmailAuthProvider = firebase.auth.EmailAuthProvider
