import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc, query, where, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Your web app's Firebase configuration (asegúrate de usar la misma configuración que en index.html)
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
const auth = getAuth(app);
const db = getFirestore(app); // Inicializa Firestore

document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.querySelector('.logout-button');
    const nombreProfesorElement = document.getElementById('nombre-profesor'); // Obtén la referencia al elemento del nombre

    onAuthStateChanged(auth, async (user) => { // Añade 'async' aquí
        if (user) {
            console.log('Usuario autenticado en maestro.html:', user.uid);
            console.log('Objeto usuario completo:', user);

            if (nombreProfesorElement) {
                // Intenta obtener el nombre del perfil de autenticación primero
                if (user.displayName) {
                    const primerNombre = user.displayName.split(' ')[0];
                    nombreProfesorElement.textContent = `Prof. ${primerNombre}`;
                } else {
                    // Si displayName es null, busca en la base de datos de Firestore
                    console.log('UID del usuario justo antes de la consulta:', user.uid);

                    // Realiza una consulta en la colección 'maestros' buscando por el campo 'uid'
                    const maestrosCollection = collection(db, 'maestros');
                    const q = query(maestrosCollection, where('uid', '==', user.uid));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const maestroDoc = querySnapshot.docs[0]; // Obtén el primer documento que coincida
                        const data = maestroDoc.data();
                        console.log('Datos del documento del maestro:', data);

                        if (data && data.nombre) {
                            const primerNombreDB = data.nombre.split(' ')[0];
                            nombreProfesorElement.textContent = `Prof. ${primerNombreDB}`;
                        } else {
                            nombreProfesorElement.textContent = 'Prof. [Nombre no disponible]';
                            console.log('No se encontró el campo "nombre" en el documento del profesor.');
                        }
                    } else {
                        nombreProfesorElement.textContent = 'Prof. [Nombre no disponible]';
                        console.log('No se encontró el documento del profesor en Firestore.');
                    }
                }
            }
        } else {
            console.log('Usuario no autenticado en maestro.html, redirigiendo a index.html');
            window.location.href = 'index.html';
        }
    });

    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            signOut(auth).then(() => {
                console.log('Sesión cerrada exitosamente');
                window.location.href = 'index.html';
            }).catch((error) => {
                console.error('Error al cerrar la sesión:', error);
                alert('Ocurrió un error al cerrar la sesión. Inténtalo de nuevo.');
            });
        });
    } else {
        console.error('No se encontró el botón de Cerrar Sesión.');
    }
});