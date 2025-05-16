import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where, orderBy, addDoc, serverTimestamp, getDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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
const alumnoId = sessionStorage.getItem('alumnoId');
const alumnoNombre = sessionStorage.getItem('alumnoNombre');
let maestroIdParaMensaje = null;
const chatTitle = document.getElementById('chat-title');

document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOMContentLoaded ejecutado.");
    if (alumnoId) {
        console.log("alumnoId obtenido:", alumnoId);
        // Obtener el ID del maestro asignado al alumno
        const alumnoDocRef = doc(db, 'alumnos', alumnoId);
        try {
            const alumnoDocSnap = await getDoc(alumnoDocRef);
            if (alumnoDocSnap.exists()) {
                console.log("Documento del alumno encontrado:", alumnoDocSnap.data());
                const alumnoData = alumnoDocSnap.data();
                if (alumnoData && alumnoData.registradoPor) {
                    maestroIdParaMensaje = alumnoData.registradoPor;
                    console.log("ID del maestro obtenido (antes de cargarNombreMaestro):", maestroIdParaMensaje);
                    await cargarNombreMaestro(maestroIdParaMensaje);
                    await cargarMensajes(alumnoId, maestroIdParaMensaje);
                    // Escuchar por nuevos mensajes (generales y personales)
                    const mensajesCollection = collection(db, 'messages');
                    const q = query(
                        mensajesCollection,
                        where('recipientType', 'in', ['general', 'personal']),
                        where('recipientId', '==', alumnoId),
                        orderBy('timestamp', 'desc')
                    );
                    onSnapshot(q, (snapshot) => {
                        cargarMensajes(alumnoId, maestroIdParaMensaje); // Recargar mensajes al haber cambios
                    });
                    // Escuchar también los mensajes personales enviados por el alumno
                    const qEnviados = query(
                        mensajesCollection,
                        where('recipientType', '==', 'personal'),
                        where('senderId', '==', alumnoId),
                        where('recipientId', '==', maestroIdParaMensaje),
                        orderBy('timestamp', 'desc')
                    );
                    onSnapshot(qEnviados, (snapshot) => {
                        cargarMensajes(alumnoId, maestroIdParaMensaje);
                    });
                } else {
                    console.log("El documento del alumno no tiene el campo 'registradoPor'.");
                    mensajesContainer.innerHTML = '<p>No se pudo identificar al maestro.</p>';
                    chatTitle.textContent = 'Mis Mensajes';
                }
            } else {
                console.log("No se encontró el documento del alumno con ID:", alumnoId);
                mensajesContainer.innerHTML = '<p>No se pudo identificar al maestro.</p>';
                chatTitle.textContent = 'Mis Mensajes';
            }
        } catch (error) {
            console.error("Error al obtener el documento del alumno:", error);
            mensajesContainer.innerHTML = '<p>Error al cargar la información del chat.</p>';
            chatTitle.textContent = 'Mis Mensajes';
        }
    } else {
        console.log("alumnoId no encontrado en sessionStorage.");
        window.location.href = 'index.html';
    }
});

async function cargarNombreMaestro(maestroId) {
    console.log("cargarNombreMaestro ejecutado con ID:", maestroId);
    if (!maestroId) {
        console.warn("cargarNombreMaestro llamado sin maestroId.");
        chatTitle.textContent = 'Mis Mensajes';
        return;
    }
    try {
        const maestroDocRef = doc(db, 'maestros', maestroId); // Obtener la referencia aquí
        const maestroDoc = await getDoc(maestroDocRef);
        if (maestroDoc.exists()) {
            const maestroData = maestroDoc.data();
            console.log("Documento del maestro encontrado:", maestroData);
            chatTitle.textContent = `Prof. ${maestroData.nombre} ${maestroData.apellido}`;
            console.log("Título actualizado a:", `Prof. ${maestroData.nombre} ${maestroData.apellido}`);
        } else {
            console.log("No se encontró el documento del maestro con ID:", maestroId);
            chatTitle.textContent = 'Mis Mensajes';
        }
    } catch (error) {
        console.error('Error al cargar el nombre del maestro:', error);
        chatTitle.textContent = 'Mis Mensajes';
    }
}

async function cargarMensajes(alumnoId, maestroId) {
    mensajesContainer.innerHTML = '<p>Cargando mensajes...</p>';
    try {
        const mensajesCollection = collection(db, 'messages');
        const q = query(
            mensajesCollection,
            orderBy('timestamp', 'asc')
        );
        const querySnapshot = await getDocs(q);
        mensajesContainer.innerHTML = '';
        const allMessages = [];

        querySnapshot.forEach((doc) => {
            const mensaje = doc.data();
            if (
                (mensaje.recipientType === 'general') ||
                (mensaje.recipientType === 'personal' && mensaje.recipientId === alumnoId) ||
                (mensaje.recipientType === 'personal' && mensaje.senderId === alumnoId && mensaje.recipientId === maestroId)
            ) {
                allMessages.push(mensaje);
            }
        });

        if (allMessages.length === 0) {
            mensajesContainer.innerHTML = '<p>No hay mensajes.</p>';
            return;
        }

        allMessages.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));

        allMessages.forEach((mensaje) => {
            mostrarMensaje(mensaje);
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

function mostrarMensaje(mensaje) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.classList.add('mensaje');
    if (mensaje.recipientType === 'personal') {
        if (mensaje.senderId === alumnoId) {
            mensajeDiv.classList.add('enviado');
        } else {
            mensajeDiv.classList.add('personal-recibido');
        }
    }
    mensajeDiv.innerHTML = `
        <p>${mensaje.body}</p>
        <small>${new Date(mensaje.timestamp?.seconds * 1000).toLocaleTimeString()}</small>
    `;
    mensajesContainer.appendChild(mensajeDiv);
}

window.enviarMensaje = async function() {
    const textoMensaje = respuestaInput.value.trim();
    if (textoMensaje !== '') {
        if (!maestroIdParaMensaje) {
            alert("No se pudo identificar al maestro para enviar el mensaje.");
            return;
        }
        try {
            const mensajesCollection = collection(db, 'messages');
            await addDoc(mensajesCollection, {
                senderId: alumnoId,
                senderName: alumnoNombre,
                recipientType: 'personal',
                recipientId: maestroIdParaMensaje,
                body: textoMensaje,
                timestamp: serverTimestamp(),
            });
            respuestaInput.value = ''; // Limpiar el input
        } catch (error) {
            console.error('Error al enviar el mensaje:', error);
            alert('Error al enviar el mensaje.');
        }
    } else {
        alert('Por favor, escribe un mensaje.');
    }
};