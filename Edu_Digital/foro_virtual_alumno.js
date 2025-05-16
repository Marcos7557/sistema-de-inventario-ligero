import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Your Firebase configuration (asegúrate de usar la misma configuración que en index.html)
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

document.addEventListener('DOMContentLoaded', async function() {
    const listaForosDiv = document.getElementById('lista-foros');
    const regresarPanelBtn = document.getElementById('regresar-panel-alumno');

    // Verificar si el usuario está autenticado
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // Redirigir al login si no está autenticado
            window.location.href = 'index.html';
        }
    });

    // Obtener la lista de foros desde Firestore
    try {
        const forosCollection = collection(db, 'foros');
        const forosSnapshot = await getDocs(forosCollection);
        listaForosDiv.innerHTML = ''; // Limpiar el mensaje de carga

        if (!forosSnapshot.empty) {
            forosSnapshot.forEach(doc => {
                const foroData = doc.data();
                const foroId = doc.id;
                const enlaceForo = document.createElement('a');
                enlaceForo.href = `foro_detalle_alumno.html?foroId=${foroId}`;

                const tituloForo = document.createElement('h3');
                tituloForo.textContent = foroData.titulo || 'Sin título';

                const descripcionForo = document.createElement('p');
                descripcionForo.textContent = foroData.descripcion || 'Sin descripción';

                enlaceForo.appendChild(tituloForo);
                enlaceForo.appendChild(descripcionForo);
                listaForosDiv.appendChild(enlaceForo);
            });
        } else {
            listaForosDiv.innerHTML = '<p>No hay foros disponibles.</p>';
        }
    } catch (error) {
        console.error('Error al obtener los foros:', error);
        listaForosDiv.innerHTML = '<p>Error al cargar los foros.</p>';
    }

    // Evento para el botón de regresar
    regresarPanelBtn.addEventListener('click', function() {
        window.location.href = 'alumno_panel.html';
    });
});