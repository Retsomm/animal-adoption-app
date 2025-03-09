// firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import Constants from 'expo-constants';

// Firebase 配置
const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.firebaseApiKey,
  authDomain: Constants.expoConfig.extra.firebaseAuthDomain,
  projectId: Constants.expoConfig.extra.firebaseProjectId,
  storageBucket: Constants.expoConfig.extra.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig.extra.firebaseMessagingSenderId,
  appId: Constants.expoConfig.extra.firebaseAppId,
  measurementId: Constants.expoConfig.extra.firebaseMeasurementId
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, app, firebaseConfig };