import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, query, where, orderBy, serverTimestamp, doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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

const mensajesContainer = document.getElementById('mensajes-container');
const respuestaInput = document.getElementById('respuesta-input');
const nombreAlumnoChatElement = document.getElementById('nombre-alumno-chat');

let alumnoId = null;
let maestroId = null;
let maestroNombre = null;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    maestroId = user.uid;
    maestroNombre = user.displayName || 'Maestro';
    // Obtener el ID del alumno de la URL
    const urlParams = new URLSearchParams(window.location.search);
    alumnoId = urlParams.get('alumnoId');

    if (alumnoId) {
        await cargarNombreAlumno(alumnoId);
        await cargarMensajes(maestroId, alumnoId);
        // Escuchar por nuevos mensajes en tiempo real
        const mensajesCollection = collection(db, 'messages');
        const q = query(
            mensajesCollection,
            where('recipientType', '==', 'personal'),
            where('recipientId', 'in', [alumnoId, maestroId]),
            where('senderId', 'in', [alumnoId, maestroId]),
            orderBy('timestamp', 'asc')
        );
        onSnapshot(q, (snapshot) => {
            cargarMensajes(maestroId, alumnoId);
        });
    } else {
        mensajesContainer.innerHTML = '<p>No se ha seleccionado ningún alumno.</p>';
    }
});

async function cargarNombreAlumno(alumnoId) {
    try {
        const alumnoDoc = await getDoc(doc(db, 'alumnos', alumnoId));
        if (alumnoDoc.exists()) {
            const alumnoData = alumnoDoc.data();
            nombreAlumnoChatElement.textContent = `Chat con ${alumnoData.nombre} ${alumnoData.apellido}`;
        } else {
            nombreAlumnoChatElement.textContent = 'Chat con Alumno';
        }
    } catch (error) {
        console.error('Error al cargar el nombre del alumno:', error);
        nombreAlumnoChatElement.textContent = 'Chat con Alumno';
    }
}

async function cargarMensajes(maestroId, alumnoId) {
    mensajesContainer.innerHTML = '<p>Cargando mensajes...</p>';
    try {
        const mensajesCollection = collection(db, 'messages');
        const q = query(
            mensajesCollection,
            where('recipientType', '==', 'personal'),
            where('recipientId', 'in', [alumnoId, maestroId]),
            where('senderId', 'in', [alumnoId, maestroId]),
            orderBy('timestamp', 'asc')
        );

        const querySnapshot = await getDocs(q);
        mensajesContainer.innerHTML = '';
        if (querySnapshot.empty) {
            mensajesContainer.innerHTML = '<p>No hay mensajes con este alumno.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const mensaje = doc.data();
            mostrarMensaje(mensaje, mensaje.senderId === maestroId);
        });
        // Scroll al final de los mensajes
        mensajesContainer.scrollTop = mensajesContainer.scrollHeight;

        // Agregar event listeners después de cargar los mensajes
        const mensajesElementos = document.querySelectorAll('.mensaje');
        mensajesElementos.forEach(mensajeElement => {
            mensajeElement.addEventListener('click', function() {
                this.classList.toggle('mostrar-hora');
            });
        });

    } catch (error) {
        console.error('Error al cargar los mensajes:', error);
        mensajesContainer.innerHTML = '<p>Error al cargar los mensajes.</p>';
    }
}

function mostrarMensaje(mensaje, esMaestro) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.classList.add('mensaje');
    mensajeDiv.classList.add(esMaestro ? 'enviado' : 'recibido'); // Añade clase 'recibido' para el alumno
    mensajeDiv.innerHTML = `<p>${mensaje.body}</p><small>${new Date(mensaje.timestamp?.seconds * 1000).toLocaleString()}</small>`;
    const smallElement = mensajeDiv.querySelector('small');
    if (smallElement) {
        smallElement.style.display = 'none'; // Ocultar la hora inicialmente
    }
    mensajesContainer.appendChild(mensajeDiv);
}

window.enviarMensajePersonal = async function() {
    const textoMensaje = respuestaInput.value.trim();
    if (textoMensaje && alumnoId && maestroId && maestroNombre) {
        try {
            const mensajesCollection = collection(db, 'messages');
            await addDoc(mensajesCollection, {
                senderId: maestroId,
                senderName: maestroNombre,
                recipientType: 'personal',
                recipientId: alumnoId,
                body: textoMensaje,
                timestamp: serverTimestamp()
            });
            respuestaInput.value = ''; // Limpiar el input
            // No es necesario recargar todos los mensajes, el onSnapshot se encargará
        } catch (error) {
            console.error('Error al enviar mensaje personal:', error);
            alert('Error al enviar el mensaje.');
        }
    } else {
        alert('Por favor, escribe un mensaje.');
    }
};