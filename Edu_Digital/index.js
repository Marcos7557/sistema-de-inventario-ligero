// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBxLwqastV6BQQk8da87hYxfBN2XRK-dq4",
    authDomain: "edudigital-3d1f6.firebaseapp.com",
    projectId: "edudigital-3d1f6",
    storageBucket: "edudigital-3d1f6.firebasestorage.app",
    messagingSenderId: "850487616745",
    appId: "1:850487616745:web:101a73670513a79ec83c78",
    measurementId: "G-344RK6CZPP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Initialize Firebase Authentication
const db = getFirestore(app); // Initialize Firestore

const loginForm = document.getElementById('login-form');
const loginErrorMessage = document.getElementById('login-error-message');

// --- Lógica para el Inicio de Sesión Unificado ---
if (loginForm) {
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const telefonoOrEmail = document.getElementById('telefono').value;

        // Intenta iniciar sesión como maestro (asumiendo que los maestros usan correo electrónico)
        if (telefonoOrEmail.includes('@')) {
            try {
                const password = prompt('Ingresa tu contraseña de maestro:'); // Considera un campo de contraseña en el formulario
                if (password) {
                    const userCredential = await signInWithEmailAndPassword(auth, telefonoOrEmail, password);
                    console.log('Maestro logueado:', userCredential.user);
                    window.location.href = 'maestro.html';
                } else {
                    loginErrorMessage.textContent = 'Contraseña requerida.';
                }
                return;
            } catch (error) {
                console.error('Error al iniciar sesión como maestro:', error);
                loginErrorMessage.textContent = 'Correo electrónico o contraseña incorrectos.';
                return;
            }
        }

        // Si no es un correo electrónico, intenta iniciar sesión como alumno por número de teléfono
        try {
            const alumnosCollection = collection(db, 'alumnos');
            const q = query(alumnosCollection, where('telefono', '==', telefonoOrEmail));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const alumnoDoc = querySnapshot.docs[0];
                const alumnoId = alumnoDoc.id;
                const alumnoData = alumnoDoc.data();
                const alumnoNombre = alumnoData.nombre; // Asumiendo que tienes un campo 'nombre' en la colección 'alumnos'

                sessionStorage.setItem('alumnoId', alumnoId); // Almacenar el ID del alumno en la sesión
                sessionStorage.setItem('alumnoNombre', alumnoNombre); // Almacenar el nombre del alumno
                window.location.href = 'alumno_panel.html';
            } else {
                loginErrorMessage.textContent = 'Número de teléfono no registrado.';
            }
        } catch (error) {
            console.error('Error al buscar alumno:', error);
            loginErrorMessage.textContent = 'Error al verificar el número de teléfono.';
        }
    });
}