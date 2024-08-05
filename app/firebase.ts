// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from 'firebase/firestore';;
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCjO4oZWNTVQtTEMthTK_M1JQ_PhyKSwn4",
    authDomain: "recipantry-3047d.firebaseapp.com",
    projectId: "recipantry-3047d",
    storageBucket: "recipantry-3047d.appspot.com",
    messagingSenderId: "88606098052",
    appId: "1:88606098052:web:6029928f60a4501d02f8d1",
    measurementId: "G-GF67JBMNQJ"
  };

  let db: Firestore | undefined;

  if (typeof window !== 'undefined' && !getApps().length) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
  
  export { db };