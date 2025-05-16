import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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

const calendarioAsistenciasDiv = document.getElementById('calendario-asistencias');
const regresarPanelBtn = document.getElementById('regresar-panel-alumno');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        await mostrarCalendarioAsistencias(user.uid);
    } else {
        window.location.href = 'index.html';
    }
});

async function obtenerAsistenciasAlumno(alumnoId) {
    try {
        const alumnoDoc = await getDoc(doc(db, 'alumnos', alumnoId));
        if (alumnoDoc.exists() && alumnoDoc.data().asistencias) {
            return alumnoDoc.data().asistencias;
        }
        return [];
    } catch (error) {
        console.error("Error al obtener asistencias del alumno:", error);
        return [];
    }
}

async function mostrarCalendarioAsistencias(alumnoId) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const primerDiaMes = new Date(year, month, 1);
    const ultimoDiaMes = new Date(year, month + 1, 0);
    const asistencias = await obtenerAsistenciasAlumno(alumnoId);

    calendarioAsistenciasDiv.innerHTML = ''; // Limpiar el calendario anterior

    // Calcular el día de la semana del primer día del mes (0 = Domingo, 1 = Lunes, ...)
    const primerDiaSemana = primerDiaMes.getDay();

    // Ajustar para que el lunes sea el primer día (si es domingo, lo convierte a 7)
    const offsetInicioMes = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;

    // Agregar espacios en blanco al inicio para alinear el primer día
    for (let i = 0; i < offsetInicioMes; i++) {
        const diaVacio = document.createElement('div');
        calendarioAsistenciasDiv.appendChild(diaVacio);
    }

    // Generar los días del mes
    for (let dia = 1; dia <= ultimoDiaMes.getDate(); dia++) {
        const fechaCalendario = new Date(year, month, dia);
        const diaSemana = fechaCalendario.getDay(); // 0 = Domingo, 1 = Lunes, ...
        const diaDiv = document.createElement('div');
        diaDiv.classList.add('dia-calendario');
        diaDiv.textContent = dia;

        const fechaString = fechaCalendario.toLocaleDateString('es-SV');
        const asistenciaDia = asistencias.find(asistencia => asistencia.fecha === fechaString);

        if (diaSemana !== 0 && diaSemana !== 6) { // Solo considerar de lunes a viernes
            if (asistenciaDia && asistenciaDia.presente) {
                diaDiv.classList.add('presente');
            } else if (asistenciaDia && !asistenciaDia.presente) {
                diaDiv.classList.add('falta') ;
            } else {
                // Si no hay registro para este día (podría ser en el futuro), dejar sin clase específica
            }
        } else {
            diaDiv.classList.add('fin-semana');
        }

        calendarioAsistenciasDiv.appendChild(diaDiv);
    }
}

regresarPanelBtn.addEventListener('click', () => {
    window.location.href = 'alumno_panel.html'; // Asegúrate de que esta ruta sea correcta
});