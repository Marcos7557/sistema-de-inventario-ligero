import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";

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
const storage = getStorage(app);

const foroTituloElement = document.getElementById('foro-titulo');
const mensajesContainer = document.getElementById('mensajes-container');
const nuevoMensajeForm = document.getElementById('nuevo-mensaje-form');
const mensajeTextoInput = document.getElementById('mensaje-texto');
const archivoAdjuntoInput = document.getElementById('archivo-adjunto');

let foroId = null;
let usuarioId = null;
let usuarioNombre = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        usuarioId = user.uid;
        usuarioNombre = user.displayName || 'Usuario'; // Obtén el nombre del usuario

        // Obtener el ID del foro de la URL
        const urlParams = new URLSearchParams(window.location.search);
        foroId = urlParams.get('foroId');

        if (foroId) {
            await cargarTituloForo(foroId);
            await cargarMensajesForo(foroId);
            iniciarEscuchaNuevosMensajes(foroId);
        } else {
            foroTituloElement.textContent = 'Foro no encontrado';
            mensajesContainer.innerHTML = '<p>ID de foro inválido.</p>';
        }
    } else {
        // Redirigir al login si no hay usuario autenticado
        window.location.href = 'index.html';
    }
});

async function cargarTituloForo(foroId) {
    try {
        const foroDoc = await getDoc(doc(db, 'foros', foroId));
        if (foroDoc.exists()) {
            foroTituloElement.textContent = foroDoc.data().nombre;
        } else {
            foroTituloElement.textContent = 'Foro no encontrado';
        }
    } catch (error) {
        console.error("Error al cargar el título del foro:", error);
        foroTituloElement.textContent = 'Error al cargar el foro';
    }
}

async function cargarMensajesForo(foroId) {
    mensajesContainer.innerHTML = '<p>Cargando mensajes...</p>';
    try {
        const mensajesRef = collection(db, 'foros', foroId, 'posts');
        const q = query(mensajesRef, orderBy('fechaCreacion', 'asc'));
        const mensajesSnapshot = await getDocs(q);
        mensajesContainer.innerHTML = '';
        if (mensajesSnapshot.empty) {
            mensajesContainer.innerHTML = '<p>No hay mensajes en este foro.</p>';
            return;
        }
        mensajesSnapshot.forEach(doc => {
            mostrarMensaje(doc.data());
        });
        // Scroll al final de los mensajes
        mensajesContainer.scrollTop = mensajesContainer.scrollHeight;
    } catch (error) {
        console.error("Error al cargar los mensajes del foro:", error);
        mensajesContainer.innerHTML = '<p>Error al cargar los mensajes.</p>';
    }
}

function iniciarEscuchaNuevosMensajes(foroId) {
    const mensajesRef = collection(db, 'foros', foroId, 'posts');
    const q = query(mensajesRef, orderBy('fechaCreacion', 'asc'));
    onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                mostrarMensaje(change.doc.data());
                // Scroll al final al recibir un nuevo mensaje
                mensajesContainer.scrollTop = mensajesContainer.scrollHeight;
            }
        });
    });
}

function mostrarMensaje(mensaje) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.classList.add('mensaje');
    if (mensaje.autorId === usuarioId) {
        mensajeDiv.classList.add('mensaje-propio');
    } else {
        mensajeDiv.classList.add('mensaje-otro');
    }

    let contenido = `<p><strong>${mensaje.autorNombre}</strong> <small>(${new Date(mensaje.fechaCreacion?.seconds * 1000).toLocaleString()})</small></p><p>${mensaje.texto}</p>`;

    if (mensaje.tipo === 'imagen' && mensaje.urlArchivo) {
        contenido += `<img src="${mensaje.urlArchivo}" alt="${mensaje.nombreArchivo}" style="max-width: 300px; height: auto;">`;
    } else if (mensaje.tipo === 'archivo' && mensaje.urlArchivo && mensaje.nombreArchivo) {
        contenido += `<p><a href="${mensaje.urlArchivo}" target="_blank" rel="noopener noreferrer">Descargar: ${mensaje.nombreArchivo}</a></p>`;
    }

    mensajeDiv.innerHTML = contenido;
    mensajesContainer.appendChild(mensajeDiv);
}

nuevoMensajeForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const textoMensaje = mensajeTextoInput.value.trim();
    const archivoAdjunto = archivoAdjuntoInput.files[0];

    if (textoMensaje || archivoAdjunto) {
        try {
            let archivoUrl = null;
            let nombreArchivo = null;
            let tipoArchivo = 'texto';

            if (archivoAdjunto) {
                const storageRef = ref(storage, `foros/${foroId}/${archivoAdjunto.name}`);
                const uploadTask = uploadBytesResumable(storageRef, archivoAdjunto);

                await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed',
                        (snapshot) => {
                            // Puedes mostrar el progreso de la subida aquí si lo deseas
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            console.log('Subida en progreso:', progress + '%');
                        },
                        (error) => {
                            console.error("Error al subir el archivo:", error);
                            reject(error);
                        },
                        async () => {
                            archivoUrl = await getDownloadURL(uploadTask.snapshot.ref);
                            nombreArchivo = archivoAdjunto.name;
                            tipoArchivo = archivoAdjunto.type.startsWith('image/') ? 'imagen' : 'archivo';
                            resolve();
                        }
                    );
                });
            }

            await addDoc(collection(db, 'foros', foroId, 'posts'), {
                autorId: usuarioId,
                autorNombre: usuarioNombre,
                texto: textoMensaje,
                tipo: tipoArchivo,
                urlArchivo: archivoUrl,
                nombreArchivo: nombreArchivo,
                fechaCreacion: serverTimestamp()
            });

            mensajeTextoInput.value = '';
            archivoAdjuntoInput.value = ''; // Limpiar el campo de archivo
        } catch (error) {
            console.error("Error al enviar el mensaje:", error);
            alert("Error al enviar el mensaje.");
        }
    } else {
        alert("Por favor, escribe un mensaje o adjunta un archivo.");
    }
});