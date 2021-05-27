import firebase from 'firebase'


const firebaseConfig = {
    apiKey: "AIzaSyBf2M5oQHlSo7KHj9ZjllWaqGpERg1a2ys",
    authDomain: "whatsapp-908a5.firebaseapp.com",
    projectId: "whatsapp-908a5",
    storageBucket: "whatsapp-908a5.appspot.com",
    messagingSenderId: "71847304538",
    appId: "1:71847304538:web:93c1717e61302319126763"
  };

  const app = !firebase.apps.length 
  ? firebase.initializeApp(firebaseConfig) 
  : firebase.app();


  const db = app.firestore();
  const auth = app.auth();
  const provider = new firebase.auth.GoogleAuthProvider();

  export {db, auth, provider}