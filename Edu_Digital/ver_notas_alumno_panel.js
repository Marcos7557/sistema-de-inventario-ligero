import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBxLwqastV6BQQk8da87hYxfBN2XRK-dq4",
    authDomain: "edudigital-3d1f6.firebaseapp.com",
    projectId: "edudigital-3d1f6",
    storageBucket: "edudigital-3d1f6.firebasestorage.app",
    messagingSenderId: "850487616745",
    appId: "1:850487616745:web:101a73670513a79ec83c78",
    measurementId: "G-344RK6CZPP"
};
// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const notasBody = document.getElementById('notas-body');

document.addEventListener('DOMContentLoaded', async () => {
    const alumnoId = sessionStorage.getItem('alumnoId');
    if (alumnoId) {
        await cargarNotas(alumnoId);
    } else {
        window.location.href = 'index.html'; // Redirigir al login si no hay ID en sesión
    }
});

async function cargarNotas(alumnoId) {
    notasBody.innerHTML = '<tr><td colspan="5">Cargando notas...</td></tr>';
    try {
        const alumnosCollection = collection(db, 'alumnos');
        const q = query(alumnosCollection, where('__name__', '==', alumnoId)); // Usamos __name__ para filtrar por ID del documento
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const alumnoDoc = querySnapshot.docs[0];
            const notas = alumnoDoc.data().notas || {};
            const promedio = calcularPromedio(notas);
            notasBody.innerHTML = `
                <tr>
                    <td>${notas.nota1 || '-'}</td>
                    <td>${notas.nota2 || '-'}</td>
                    <td>${notas.nota3 || '-'}</td>
                    <td>${notas.nota4 || '-'}</td>
                    <td>${promedio}</td>
                </tr>
            `;
        } else {
            notasBody.innerHTML = '<tr><td colspan="5">No se encontraron notas.</td></tr>';
        }
    } catch (error) {
        console.error('Error al cargar las notas:', error);
        notasBody.innerHTML = '<tr><td colspan="5">Error al cargar las notas.</td></tr>';
    }
}

function calcularPromedio(notas) {
    const n1 = parseFloat(notas.nota1) || 0;
    const n2 = parseFloat(notas.nota2) || 0;
    const n3 = parseFloat(notas.nota3) || 0;
    const n4 = parseFloat(notas.nota4) || 0;
    const promedio = (n1 + n2 + n3 + n4) / 4;
    return isNaN(promedio) ? '-' : promedio.toFixed(2);
}