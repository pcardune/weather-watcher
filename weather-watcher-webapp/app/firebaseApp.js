// TODO: only import firebase/app and firebase/database
import firebase from 'firebase';
import {firebaseConfig} from './constants';

const firebaseApp = firebase.initializeApp(firebaseConfig);

if (!process.env.IS_SERVER && process.env.NODE_ENV !== 'production') {
  window.firebase = firebaseApp;
}

export default firebaseApp;
