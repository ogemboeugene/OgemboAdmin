// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBTz4MU7Nr1dcxinLF7b5YJnAocOM6aDIA",
  authDomain: "shopokoa-d1e64.firebaseapp.com",
  projectId: "shopokoa-d1e64",
  storageBucket: "shopokoa-d1e64.appspot.com",
  messagingSenderId: "223008372326",
  appId: "1:223008372326:web:a5977454b214dfdc521fa7",
  measurementId: "G-9NXXF1WR4R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics (optional)
const analytics = getAnalytics(app);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app);

// Initialize Firebase Auth
const auth = getAuth(app);

export { app, analytics, storage, auth };
export default app;
