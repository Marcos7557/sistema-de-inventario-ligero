import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc, arrayUnion, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";


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

const fechaActualElement = document.getElementById('fecha-actual');
const listaAlumnosUl = document.getElementById('lista-alumnos');
const confirmarAsistenciaBtn = document.getElementById('confirmar-asistencia');
const regresarPanelBtn = document.getElementById('regresar-panel-maestro');

let alumnosData = [];
const asistenciaDia = {}; // Objeto para rastrear la asistencia del día

onAuthStateChanged(auth, async (user) => {
    if (user) {
        mostrarFechaActual();
        await cargarAlumnos();
    } else {
        window.location.href = 'index.html';
    }
});

function mostrarFechaActual() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    fechaActualElement.textContent = now.toLocaleDateString('es-SV', options);
}

async function cargarAlumnos() {
    listaAlumnosUl.innerHTML = 'Cargando alumnos...';
    try {
        const alumnosCollection = collection(db, 'alumnos');
        const alumnosSnapshot = await getDocs(alumnosCollection);
        listaAlumnosUl.innerHTML = '';
        alumnosData = [];

        alumnosSnapshot.forEach(doc => {
            const alumno = { id: doc.id, ...doc.data() };
            alumnosData.push(alumno);
            asistenciaDia[alumno.id] = false; // Inicialmente todos ausentes
            mostrarAlumnoEnLista(alumno);
        });
    } catch (error) {
        console.error("Error al cargar alumnos:", error);
        listaAlumnosUl.innerHTML = 'Error al cargar la lista de alumnos.';
    }
}

function mostrarAlumnoEnLista(alumno) {
    const listItem = document.createElement('li');
    const nombreAlumnoSpan = document.createElement('span');
    nombreAlumnoSpan.classList.add('alumno-nombre');
    nombreAlumnoSpan.textContent = alumno.nombre;
    nombreAlumnoSpan.addEventListener('click', () => {
        asistenciaDia[alumno.id] = !asistenciaDia[alumno.id];
        actualizarEstiloAlumno(alumno.id, nombreAlumnoSpan, checkboxAsistencia);
    });

    const checkboxAsistencia = document.createElement('input');
    checkboxAsistencia.type = 'checkbox';
    checkboxAsistencia.classList.add('checkbox-asistencia');
    checkboxAsistencia.addEventListener('change', () => {
        asistenciaDia[alumno.id] = checkboxAsistencia.checked;
        actualizarEstiloAlumno(alumno.id, nombreAlumnoSpan, checkboxAsistencia);
    });

    listItem.appendChild(nombreAlumnoSpan);
    listItem.appendChild(checkboxAsistencia);
    listaAlumnosUl.appendChild(listItem);
    actualizarEstiloAlumno(alumno.id, nombreAlumnoSpan, checkboxAsistencia); // Estilo inicial
}

function actualizarEstiloAlumno(alumnoId, nombreElement, checkboxElement) {
    if (asistenciaDia[alumnoId]) {
        nombreElement.classList.add('alumno-presente');
        nombreElement.classList.remove('alumno-ausente');
        checkboxElement.classList.add('checkbox-presente');
        checkboxElement.classList.remove('checkbox-ausente');
        checkboxElement.checked = true;
    } else {
        nombreElement.classList.remove('alumno-presente');
        nombreElement.classList.add('alumno-ausente');
        checkboxElement.classList.remove('checkbox-presente');
        checkboxElement.classList.add('checkbox-ausente');
        checkboxElement.checked = false;
    }
}

confirmarAsistenciaBtn.addEventListener('click', async () => {
    const fechaHoy = new Date().toLocaleDateString('es-SV');
    let presentes = 0;
    let ausentes = 0;

    for (const alumnoId in asistenciaDia) {
        if (asistenciaDia[alumnoId]) {
            presentes++;
            try {
                const alumnoRef = doc(db, 'alumnos', alumnoId);
                await updateDoc(alumnoRef, {
                    asistencias: arrayUnion({ fecha: fechaHoy, presente: true })
                });
            } catch (error) {
                console.error("Error al guardar asistencia del alumno:", alumnoId, error);
                alert(`Error al guardar la asistencia de algunos alumnos.`);
                return;
            }
        } else {
            ausentes++;
            try {
                const alumnoRef = doc(db, 'alumnos', alumnoId);
                await updateDoc(alumnoRef, {
                    asistencias: arrayUnion({ fecha: fechaHoy, presente: false })
                });
            } catch (error) {
                console.error("Error al guardar falta del alumno:", alumnoId, error);
                alert(`Error al guardar la asistencia de algunos alumnos.`);
                return;
            }
        }
    }

    alert(`Asistencia guardada. Presentes: ${presentes}, Ausentes: ${ausentes}`);
    // Opcional: Redirigir a otra página o cerrar la ventana
});

if (regresarPanelBtn) {
    regresarPanelBtn.addEventListener('click', () => {
        window.location.href = 'maestro.html'; // Asegúrate de que esta ruta sea correcta
    });
}