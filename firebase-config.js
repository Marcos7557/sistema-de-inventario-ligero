import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

    const firebaseConfig = {
    apiKey: "AIzaSyCLFUnGRi12GHdAcb1W4OFLsQrJQ9ocYKs",
    authDomain: "inventario-light-d3aa5.firebaseapp.com",
    projectId: "inventario-light-d3aa5",
    storageBucket: "inventario-light-d3aa5.firebasestorage.app",
    messagingSenderId: "326691043582",
    appId: "1:326691043582:web:7baa583af785d2e2cb8daf",
    measurementId: "G-8VZ3H3DV39"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Habilitar el registro detallado de Firebase (solo para depuración)
    auth.onAuthStateChanged(user => {
      if (user) {
        console.log("Firebase Auth State Changed (Usuario conectado):", user);
      } else {
        console.log("Firebase Auth State Changed (Usuario desconectado)");
      }
    });

    export { auth, app, db, initializeApp, firebaseConfig };
    