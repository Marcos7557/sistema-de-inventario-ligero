import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const forosListaDiv = document.getElementById('foros-lista');
const crearForoSeccion = document.getElementById('crear-foro-seccion');
const crearForoForm = document.getElementById('crear-foro-form');
const regresarPanelBtn = document.getElementById('regresar-panel-maestro'); // Obtener el botón de regresar

let maestroId = null;
let maestroNombre = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        maestroId = user.uid;
        maestroNombre = user.displayName || 'Maestro'; // Obtén el nombre del maestro

        // Determinar si el usuario es maestro (esto dependerá de tu lógica de roles)
        const esMaestro = true; // ¡CAMBIAR ESTO POR TU LÓGICA REAL!
        if (esMaestro) {
            crearForoSeccion.style.display = 'block';
        } else {
            crearForoSeccion.style.display = 'none';
        }

        cargarForos();
    } else {
        // Redirigir al login si no hay usuario autenticado
        window.location.href = 'index.html';
    }
});

async function cargarForos() {
    forosListaDiv.innerHTML = '<h2>Foros Disponibles</h2><p>Cargando foros...</p>';
    try {
        const forosCollection = collection(db, 'foros');
        const forosSnapshot = await getDocs(forosCollection);
        forosListaDiv.innerHTML = '<h2>Foros Disponibles</h2>';
        if (forosSnapshot.empty) {
            forosListaDiv.innerHTML += '<p>No hay foros disponibles.</p>';
            return;
        }
        forosSnapshot.forEach(doc => {
            const foro = doc.data();
            const foroItem = document.createElement('div');
            foroItem.classList.add('foro-item');
            foroItem.innerHTML = `
                <div class="foro-info">
                    <h3>${foro.nombre}</h3>
                    <p>${foro.descripcion || 'Sin descripción'}</p>
                    <small>Creado por: ${foro.creadorNombre}</small>
                </div>
                <a href="foro_detalle.html?foroId=${doc.id}" class="foro-link">Ir al Foro</a>
            `;
            forosListaDiv.appendChild(foroItem);
        });
    } catch (error) {
        console.error("Error al cargar los foros:", error);
        forosListaDiv.innerHTML = '<p>Error al cargar los foros.</p>';
    }
}

crearForoForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nombreForo = document.getElementById('nombre-foro').value.trim();
    const descripcionForo = document.getElementById('descripcion-foro').value.trim();

    if (nombreForo) {
        try {
            await addDoc(collection(db, 'foros'), {
                nombre: nombreForo,
                descripcion: descripcionForo,
                creadorId: maestroId,
                creadorNombre: maestroNombre,
                fechaCreacion: serverTimestamp()
            });
            crearForoForm.reset();
            cargarForos(); // Recargar la lista de foros después de crear uno nuevo
        } catch (error) {
            console.error("Error al crear el foro:", error);
            alert("Error al crear el foro.");
        }
    } else {
        alert("Por favor, ingresa el nombre del foro.");
    }
});

// Lógica para el botón de regresar
if (regresarPanelBtn) {
    regresarPanelBtn.addEventListener('click', function() {
        window.location.href = 'maestro.html'; // Asegúrate de que esta ruta sea correcta
    });
}