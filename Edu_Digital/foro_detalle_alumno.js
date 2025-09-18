import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, orderBy, onSnapshot, addDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Your Firebase configuration
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
    const foroTituloElement = document.getElementById('foro-titulo');
    const foroDescripcionElement = document.getElementById('foro-descripcion');
    const listaMensajesDiv = document.getElementById('lista-mensajes');
    const formularioMensaje = document.getElementById('formulario-mensaje');
    const contenidoMensajeInput = document.getElementById('contenido-mensaje');
    const regresarForoVirtualBtn = document.getElementById('regresar-foro-virtual');

    const urlParams = new URLSearchParams(window.location.search);
    const foroId = urlParams.get('foroId');

    // Verificar autenticación
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = 'index.html';
        }
    });

    if (foroId) {
        // Obtener detalles del foro
        const foroDocRef = doc(db, 'foros', foroId);
        getDoc(foroDocRef).then((docSnap) => {
            if (docSnap.exists()) {
                const foroData = docSnap.data();
                foroTituloElement.textContent = foroData.titulo || 'Sin título';
                foroDescripcionElement.textContent = foroData.descripcion || '';
            } else {
                foroTituloElement.textContent = 'Foro no encontrado';
            }
        }).catch((error) => {
            console.error('Error al obtener detalles del foro:', error);
            foroTituloElement.textContent = 'Error al cargar el foro';
        });

        // Obtener y mostrar mensajes del foro (en tiempo real)
        const mensajesCollectionRef = collection(db, 'foros', foroId, 'mensajes');
        const mensajesQuery = query(mensajesCollectionRef, orderBy('fechaEnvio'));

        onSnapshot(mensajesQuery, (snapshot) => {
            listaMensajesDiv.innerHTML = '<h2>Mensajes</h2>'; // Limpiar mensajes anteriores
            if (!snapshot.empty) {
                snapshot.forEach(doc => {
                    const mensajeData = doc.data();
                    const mensajeDiv = document.createElement('div');
                    mensajeDiv.classList.add('mensaje');

                    const autorParrafo = document.createElement('p');
                    autorParrafo.classList.add('autor');
                    autorParrafo.textContent = mensajeData.autorNombre || 'Anónimo';

                    const fechaParrafo = document.createElement('p');
                    fechaParrafo.classList.add('fecha');
                    const fecha = mensajeData.fechaEnvio ? mensajeData.fechaEnvio.toDate() : new Date();
                    fechaParrafo.textContent = new Intl.DateTimeFormat('es-SV', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(fecha);

                    const contenidoParrafo = document.createElement('p');
                    contenidoParrafo.classList.add('contenido');
                    contenidoParrafo.textContent = mensajeData.contenido;

                    mensajeDiv.appendChild(autorParrafo);
                    mensajeDiv.appendChild(fechaParrafo);
                    mensajeDiv.appendChild(contenidoParrafo);
                    listaMensajesDiv.appendChild(mensajeDiv);
                });
            } else {
                listaMensajesDiv.innerHTML += '<p>No hay mensajes en este foro.</p>';
            }
        });

        // Evento para enviar un nuevo mensaje
        formularioMensaje.addEventListener('submit', async function(event) {
            event.preventDefault();
            const contenido = contenidoMensajeInput.value.trim();
            const user = auth.currentUser;

            if (contenido && user) {
                try {
                    const maestroDocRef = doc(db, 'maestros', /* Aquí iría el ID del maestro que creó el foro si quieres rastrearlo */);
                    const maestroDocSnap = await getDoc(maestroDocRef);
                    let autorNombre = 'Alumno'; // Por defecto

                    // Intenta obtener el nombre del alumno (puedes tener una colección 'alumnos')
                    const alumnoDocRef = doc(db, 'alumnos', user.uid);
                    const alumnoDocSnap = await getDoc(alumnoDocRef);
                    if (alumnoDocSnap.exists() && alumnoDocSnap.data().nombre) {
                        autorNombre = alumnoDocSnap.data().nombre.split(' ')[0];
                    }

                    await addDoc(collection(db, 'foros', foroId, 'mensajes'), {
                        autorId: user.uid,
                        autorNombre: autorNombre,
                        contenido: contenido,
                        fechaEnvio: new Date()
                    });
                    contenidoMensajeInput.value = ''; // Limpiar el formulario
                } catch (error) {
                    console.error('Error al enviar el mensaje:', error);
                    alert('Ocurrió un error al enviar tu mensaje.');
                }
            } else if (!user) {
                alert('Debes iniciar sesión para enviar un mensaje.');
            } else {
                alert('Por favor, escribe un mensaje.');
            }
        });
    } else {
        foroTituloElement.textContent = 'ID de foro inválido';
    }

    // Evento para regresar a la lista de foros
    regresarForoVirtualBtn.addEventListener('click', function() {
        window.location.href = 'foro_virtual_alumno.html';
    });
});