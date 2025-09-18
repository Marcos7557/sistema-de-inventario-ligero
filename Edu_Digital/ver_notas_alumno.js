import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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
    const notasTableBody = document.getElementById('notas-table-body');
    const guardarNotasGeneralBtn = document.getElementById('guardar-notas-general-btn');
    let alumnosData = []; // Array para almacenar los datos de los alumnos con sus notas

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log('Maestro autenticado en gestion_notas.html:', user.uid);
            await cargarListaAlumnosConNotas(user.uid);
        } else {
            console.log('Usuario no autenticado, redirigiendo a index.html');
            window.location.href = 'index.html';
        }
    });

    async function cargarListaAlumnosConNotas(maestroUid) {
        if (!notasTableBody) return;
        notasTableBody.innerHTML = '<tr class="loading-row"><td colspan="6">Cargando lista de alumnos y notas...</td></tr>';
        alumnosData = [];

        try {
            const alumnosCollection = collection(db, 'alumnos');
            const q = query(alumnosCollection, where('registradoPor', '==', maestroUid));
            const querySnapshot = await getDocs(q);
            notasTableBody.innerHTML = ''; // Limpiar el mensaje de carga

            querySnapshot.forEach((doc) => {
                const alumno = doc.data();
                const alumnoId = doc.id;
                alumnosData.push({ id: alumnoId, ...alumno });

                const row = notasTableBody.insertRow();
                const nombreCell = row.insertCell();
                nombreCell.textContent = `${alumno.nombre} ${alumno.apellido}`;

                const bimestre1Cell = row.insertCell();
                const nota1Input = document.createElement('input');
                nota1Input.type = 'number';
                nota1Input.min = '0';
                nota1Input.max = '10';
                nota1Input.value = alumno.notas?.nota1 || '';
                nota1Input.classList.add('nota-input');
                bimestre1Cell.appendChild(nota1Input);

                const bimestre2Cell = row.insertCell();
                const nota2Input = document.createElement('input');
                nota2Input.type = 'number';
                nota2Input.min = '0';
                nota2Input.max = '10';
                nota2Input.value = alumno.notas?.nota2 || '';
                nota2Input.classList.add('nota-input');
                bimestre2Cell.appendChild(nota2Input);

                const bimestre3Cell = row.insertCell();
                const nota3Input = document.createElement('input');
                nota3Input.type = 'number';
                nota3Input.min = '0';
                nota3Input.max = '10';
                nota3Input.value = alumno.notas?.nota3 || '';
                nota3Input.classList.add('nota-input');
                bimestre3Cell.appendChild(nota3Input);

                const bimestre4Cell = row.insertCell();
                const nota4Input = document.createElement('input');
                nota4Input.type = 'number';
                nota4Input.min = '0';
                nota4Input.max = '10';
                nota4Input.value = alumno.notas?.nota4 || '';
                nota4Input.classList.add('nota-input');
                bimestre4Cell.appendChild(nota4Input);

                const promedioCell = row.insertCell();
                promedioCell.textContent = calcularPromedioFila(alumno.notas);
                promedioCell.classList.add('promedio-cell');
            });

        } catch (error) {
            console.error('Error al cargar la lista de alumnos y notas:', error);
            notasTableBody.innerHTML = '<tr><td colspan="6">Error al cargar la lista.</td></tr>';
        }
    }

    function calcularPromedioFila(notas) {
        if (!notas) return '-';
        const n1 = parseFloat(notas.nota1) || 0;
        const n2 = parseFloat(notas.nota2) || 0;
        const n3 = parseFloat(notas.nota3) || 0;
        const n4 = parseFloat(notas.nota4) || 0;
        const promedio = (n1 + n2 + n3 + n4) / 4;
        return isNaN(promedio) ? '-' : promedio.toFixed(2);
    }

    if (guardarNotasGeneralBtn) {
        guardarNotasGeneralBtn.addEventListener('click', async function() {
            const rows = notasTableBody.rows;
            const updates = [];

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const alumnoId = alumnosData[i]?.id;
                if (alumnoId) {
                    const nota1 = parseFloat(row.cells[1].querySelector('input')?.value) || null;
                    const nota2 = parseFloat(row.cells[2].querySelector('input')?.value) || null;
                    const nota3 = parseFloat(row.cells[3].querySelector('input')?.value) || null;
                    const nota4 = parseFloat(row.cells[4].querySelector('input')?.value) || null;

                    updates.push(updateDoc(doc(db, 'alumnos', alumnoId), {
                        notas: { nota1, nota2, nota3, nota4 }
                    }));
                }
            }

            try {
                await Promise.all(updates);
                alert('Notas guardadas exitosamente.');
                // Recargar la lista para actualizar promedios
                await cargarListaAlumnosConNotas(auth.currentUser.uid);
            } catch (error) {
                console.error('Error al guardar las notas:', error);
                alert('Error al guardar las notas. Inténtelo de nuevo.');
            }
        });
    }
});