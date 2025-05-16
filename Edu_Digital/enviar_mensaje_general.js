// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase Configuration (asegúrate de usar tu configuración)
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
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const enviarMensajeForm = document.getElementById('enviar-mensaje-general-form');
    const mensajeResultadoDiv = document.getElementById('mensaje-resultado');

    onAuthStateChanged(auth, (user) => {
        if (!user) {
            console.log('Usuario no autenticado, redirigiendo.');
            window.location.href = 'index.html';
        }
    });

    enviarMensajeForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const asunto = document.getElementById('asunto').value;
        const cuerpo = document.getElementById('cuerpo').value;
        const maestroId = auth.currentUser.uid;
        const maestroNombre = auth.currentUser.displayName || 'Maestro'; // Intenta obtener el nombre del usuario

        try {
            const mensajesCollection = collection(db, 'messages');
            await addDoc(mensajesCollection, {
                senderId: maestroId,
                senderName: maestroNombre,
                recipientType: 'general',
                asunto: asunto,
                body: cuerpo,
                timestamp: serverTimestamp()
            });

            mensajeResultadoDiv.textContent = 'Mensaje general enviado exitosamente.';
            mensajeResultadoDiv.className = 'mensaje-exito';
            enviarMensajeForm.reset();

        } catch (error) {
            console.error('Error al enviar el mensaje general:', error);
            mensajeResultadoDiv.textContent = 'Error al enviar el mensaje. Inténtelo de nuevo.';
            mensajeResultadoDiv.className = 'mensaje-error';
        }
    });
});
