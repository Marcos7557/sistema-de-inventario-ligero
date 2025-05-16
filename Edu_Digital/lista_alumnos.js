import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, query, where } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase configuration (asegúrate de usar la misma que en otros archivos)
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

document.addEventListener('DOMContentLoaded', async function() {
    const alumnosTableBody = document.getElementById('alumnos-table-body');
    const volverBtn = document.getElementById('volver-panel');
    const mostrarRegistroAlumnoBtnLista = document.getElementById('mostrar-registro-alumno-btn-lista');
    const registroAlumnosContainerLista = document.getElementById('registro-alumnos-container-lista');
    const registroAlumnoFormLista = document.getElementById('registro-alumno-form-lista');
    const imprimirListaBtn = document.getElementById('imprimir-lista-btn');

    if (volverBtn) {
        volverBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'maestro.html';
        });
    }

    if (mostrarRegistroAlumnoBtnLista && registroAlumnosContainerLista) {
        mostrarRegistroAlumnoBtnLista.addEventListener('click', function() {
            registroAlumnosContainerLista.style.display = registroAlumnosContainerLista.style.display === 'none' ? 'block' : 'none';
        });
    }

    if (registroAlumnoFormLista) {
        registroAlumnoFormLista.addEventListener('submit', async function(event) {
            event.preventDefault();

            const nombreAlumno = document.getElementById('nombre-alumno').value;
            const apellidoAlumno = document.getElementById('apellido-alumno').value;
            const nombreResponsable = document.getElementById('nombre-responsable').value;
            const parentescoResponsable = document.getElementById('parentesco-responsable').value;
            const telefonoResponsable = document.getElementById('telefono-responsable').value;

            try {
                const alumnosCollection = collection(db, 'alumnos');
                const docRef = await addDoc(alumnosCollection, {
                    nombre: nombreAlumno,
                    apellido: apellidoAlumno,
                    responsable: nombreResponsable,
                    parentesco: parentescoResponsable,
                    telefono: telefonoResponsable,
                    registradoPor: auth.currentUser.uid,
                    fechaRegistro: new Date()
                });

                console.log('Alumno registrado con ID:', docRef.id);
                alert('Alumno registrado exitosamente!');
                registroAlumnoFormLista.reset();
                registroAlumnosContainerLista.style.display = 'none';

                await cargarListaAlumnos(auth.currentUser.uid);

            } catch (error) {
                console.error('Error al registrar alumno en Firestore:', error);
                alert('Hubo un error al registrar al alumno. Por favor, inténtalo de nuevo.');
            }
        });
    }

    if (imprimirListaBtn) {
        imprimirListaBtn.addEventListener('click', function() {
            window.print();
        });
    }

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log('Maestro autenticado en lista_alumnos.html:', user.uid);
            await cargarListaAlumnos(user.uid);
        } else {
            console.log('Maestro no autenticado en lista_alumnos.html, redirigiendo a index.html');
            window.location.href = 'index.html';
        }
    });

    async function cargarListaAlumnos(maestroUid) {
        if (!alumnosTableBody) return;
        alumnosTableBody.innerHTML = '<tr><td colspan="5">Cargando lista de alumnos...</td></tr>';

        try {
            const alumnosCollection = collection(db, 'alumnos');
            const q = query(alumnosCollection, where('registradoPor', '==', maestroUid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                let tableHTML = '';
                querySnapshot.forEach((doc) => {
                    const alumno = doc.data();
                    tableHTML += `
                        <tr>
                            <td>${alumno.nombre}</td>
                            <td>${alumno.apellido}</td>
                            <td>${alumno.responsable}</td>
                            <td>${alumno.parentesco}</td>
                            <td>${alumno.telefono}</td>
                        </tr>
                    `;
                });
                alumnosTableBody.innerHTML = tableHTML;
            } else {
                alumnosTableBody.innerHTML = '<tr><td colspan="5">No hay alumnos registrados aún.</td></tr>';
            }
        } catch (error) {
            console.error('Error al cargar la lista de alumnos:', error);
            alumnosTableBody.innerHTML = '<tr><td colspan="5">Error al cargar la lista de alumnos.</td></tr>';
        }
    }
});