import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// *** ¡AQUÍ DEBES AGREGAR TU CONFIGURACIÓN DE FIREBASE! ***
const firebaseConfig = {
    apiKey: "AIzaSyBxLwqastV6BQQk8da87hYxfBN2XRK-dq4",
    authDomain: "edudigital-3d1f6.firebaseapp.com",
    projectId: "edudigital-3d1f6",
    storageBucket: "edudigital-3d1f6.firebasestorage.app",
    messagingSenderId: "850487616745",
    appId: "1:850487616745:web:101a73670513a79ec83c78",
    measurementId: "G-344RK6CZPP"
};
// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const userInfoDisplay = document.getElementById('user-info');
const logoutButton = document.getElementById('logout-btn');

document.addEventListener('DOMContentLoaded', () => {
    const alumnoId = sessionStorage.getItem('alumnoId');
    const alumnoNombre = sessionStorage.getItem('alumnoNombre'); // Recuperar el nombre

    if (alumnoId && alumnoNombre) {
        userInfoDisplay.textContent = `Bienvenido, ${alumnoNombre}`; // Mostrar el nombre
    } else if (alumnoId) {
        userInfoDisplay.textContent = `Bienvenido, Alumno (ID local: ${alumnoId})`; // Mostrar ID si no hay nombre (fallback)
    }
     else {
        window.location.href = 'index.html'; // Redirigir al login si no hay ID en sesión
    }
});
// En alumno_panel.html
logoutButton.addEventListener('click', async () => {
    console.log('alumno_panel.html: Botón de cerrar sesión del alumno clickeado.');
    console.log('alumno_panel.html: sessionStorage antes de remover:', sessionStorage);
    sessionStorage.removeItem('alumnoId');
    console.log('alumno_panel.html: alumnoId removido.');
    sessionStorage.removeItem('alumnoNombre');
    console.log('alumno_panel.html: alumnoNombre removido.');
    console.log('alumno_panel.html: sessionStorage después de remover:', sessionStorage);
    try {
        // await signOut(auth); // Asegúrate de que esta línea SIGUE COMENTADA
        console.log('alumno_panel.html: signOut(auth) NO ejecutado (COMENTADO).');
        window.location.href = 'index.html';
        console.log('alumno_panel.html: Redirigiendo a index.html');
    } catch (error) {
        console.error('alumno_panel.html: Error al cerrar sesión (a pesar de estar comentado):', error);
    }
});

// Comprueba si hay algún listener de 'storage' que pueda estar afectando la sesión
window.addEventListener('storage', (event) => {
    console.log('alumno_panel.html: Evento de almacenamiento detectado:', event);
    if (event.key === 'firebase:authUser:' + app.options.apiKey) {
        console.log('alumno_panel.html: Cambio en la autenticación de Firebase detectado por storage event.');
    }
});

// Comprueba el estado de autenticación al cargar la página (por si acaso)
auth.onAuthStateChanged((user) => {
    console.log('alumno_panel.html: Cambio en el estado de autenticación (onAuthStateChanged):', user);
});