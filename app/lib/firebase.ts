import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';

const firebaseConfig = {
    databaseURL: "https://goodjuicechat.firebaseio.com",
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: "goodjuicechat.firebaseapp.com",
    projectId: "goodjuicechat",
    storageBucket: "goodjuicechat.appspot.com",
    messagingSenderId: "469545115838",
    appId: "1:469545115838:web:8917b968b138306269feef",
    measurementId: "G-GVVXSEZX3X"
};

let app: FirebaseApp;
let auth: Auth;
let database: Database;

try {
    app = getApps()[0] ?? initializeApp(firebaseConfig);
    auth = getAuth(app);
    database = getDatabase(app);
} catch (error) {
    console.error("Error initializing Firebase:", error);
    throw error;
}

const googleProvider = new GoogleAuthProvider();

export { app, auth, database, googleProvider };