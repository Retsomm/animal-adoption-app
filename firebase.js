// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhhmuWcbYzpnAgblBS9BZkz_RI-4urRHs",
  authDomain: "animal-adoption-82e5f.firebaseapp.com",
  projectId: "animal-adoption-82e5f",
  storageBucket: "animal-adoption-82e5f.firebasestorage.app",
  messagingSenderId: "829596529963",
  appId: "1:829596529963:web:48751793c736487cccc16e",
  measurementId: "G-Q461RJQ2E6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);