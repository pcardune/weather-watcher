// TODO: only import firebase/app and firebase/database
import firebase from 'firebase';

const firebaseApp = firebase.initializeApp({
  apiKey: 'AIzaSyA9dBTF1MZE3jyhjwG37unYMhbQEGurZF4',
  authDomain: 'weather-watcher-170701.firebaseapp.com',
  databaseURL: 'https://weather-watcher-170701.firebaseio.com',
  projectId: 'weather-watcher-170701',
  storageBucket: 'weather-watcher-170701.appspot.com',
  messagingSenderId: '936791071551',
});

if (!process.env.IS_SERVER && process.env.NODE_ENV !== 'production') {
  window.firebase = firebaseApp;
}

export default firebaseApp;
