// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, set, push, get, child } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBCiFCeNAwi-gM4tW-AiFW8MVNPwO37pwg",
    authDomain: "zarcereno-f6b3b.firebaseapp.com",
    databaseURL: "https://zarcereno-f6b3b-default-rtdb.firebaseio.com",
    projectId: "zarcereno-f6b3b",
    storageBucket: "zarcereno-f6b3b.firebasestorage.app",
    messagingSenderId: "618781671699",
    appId: "1:618781671699:web:e8b9e9abc38a55683bdae6",
    measurementId: "G-FC1CL1B42P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set, push};
