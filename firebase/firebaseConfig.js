// firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyAhhmuWcbYzpnAgblBS9BZkz_RI-4urRHs",
  authDomain: "animal-adoption-82e5f.firebaseapp.com",
  projectId: "animal-adoption-82e5f",
  storageBucket: "animal-adoption-82e5f.appspot.com",
  messagingSenderId: "829596529963",
  appId: "1:829596529963:web:48751793c736487cccc16e",
  measurementId: "G-Q461RJQ2E6"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, app, firebaseConfig };