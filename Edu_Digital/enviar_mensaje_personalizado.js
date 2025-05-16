import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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

const listaAlumnosElement = document.getElementById('lista-alumnos');

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    await cargarAlumnos(user.uid);
    iniciarEscuchaNuevosMensajes();
});

async function cargarAlumnos(maestroId) {
    listaAlumnosElement.innerHTML = '<li>Cargando alumnos...</li>';
    try {
        const alumnosCollection = collection(db, 'alumnos');
        const q = query(alumnosCollection, where('registradoPor', '==', maestroId));
        const snapshot = await getDocs(q);
        listaAlumnosElement.innerHTML = '';
        snapshot.forEach(doc => {
            const alumno = doc.data();
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `chat_personalizado.html?alumnoId=${doc.id}`;
            link.textContent = `${alumno.nombre} ${alumno.apellido}`;
            listItem.appendChild(link);
            listaAlumnosElement.appendChild(listItem);
        });
        if (snapshot.empty) {
            listaAlumnosElement.innerHTML = '<li>No hay alumnos registrados.</li>';
        }
    } catch (error) {
        console.error('Error al cargar alumnos:', error);
        listaAlumnosElement.innerHTML = '<li>Error al cargar alumnos.</li>';
    }
}

function iniciarEscuchaNuevosMensajes() {
    const mensajesCollection = collection(db, 'messages');
    const q = query(mensajesCollection,
        where('recipientId', '==', auth.currentUser.uid),
        where('status', '==', 'unread'),
        where('senderType', '==', 'alumno')
    );

    onSnapshot(q, (snapshot) => {
        const alumnosConNuevosMensajes = new Set();
        snapshot.forEach(doc => {
            const mensaje = doc.data();
            if (mensaje.senderType === 'alumno') {
                alumnosConNuevosMensajes.add(mensaje.senderId);
            }
        });
        actualizarIndicadoresNuevosMensajes(alumnosConNuevosMensajes);
    });
}

async function obtenerNombreAlumno(alumnoId) {
    try {
        const alumnoDoc = await getDoc(doc(db, 'alumnos', alumnoId));
        if (alumnoDoc.exists()) {
            return `${alumnoDoc.data().nombre} ${alumnoDoc.data().apellido}`;
        }
        return 'Alumno Desconocido';
    } catch (error) {
        console.error('Error al obtener nombre del alumno:', error);
        return 'Error al obtener nombre';
    }
}

function actualizarIndicadoresNuevosMensajes(alumnoIds) {
    const listaItems = listaAlumnosElement.querySelectorAll('li');
    listaItems.forEach(async (li) => {
        const link = li.querySelector('a');
        if (link) {
            const urlParams = new URLSearchParams(link.href);
            const alumnoIdEnlace = urlParams.get('alumnoId');
            if (alumnoIds.has(alumnoIdEnlace)) {
                // Si el alumno tiene nuevos mensajes, agregar un indicador
                let indicador = li.querySelector('.nuevo-mensaje-indicator');
                if (!indicador) {
                    indicador = document.createElement('span');
                    indicador.classList.add('nuevo-mensaje-indicator');
                    indicador.textContent = 'Nuevo'; // Puedes poner un número si quieres contar mensajes por alumno
                    li.appendChild(indicador);
                }
            } else {
                // Si no hay nuevos mensajes, remover el indicador
                const indicadorExistente = li.querySelector('.nuevo-mensaje-indicator');
                if (indicadorExistente) {
                    indicadorExistente.remove();
                }
            }
        }
    });
}