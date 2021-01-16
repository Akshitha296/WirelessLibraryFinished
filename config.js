import firebase from 'firebase/app';
require('@firebase/firestore');

var firebaseConfig = {
    apiKey: "AIzaSyCKKDIzAp4Xxpx-Ajm1PGRr9_Yazd_BWiQ",
    authDomain: "wily-d7c42.firebaseapp.com",
    projectId: "wily-d7c42",
    storageBucket: "wily-d7c42.appspot.com",
    messagingSenderId: "725164044254",
    appId: "1:725164044254:web:e55c918c0fa35f0991374f"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  export default firebase.firestore();