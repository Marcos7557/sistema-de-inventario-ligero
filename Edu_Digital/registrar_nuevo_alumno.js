import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Your web app's Firebase configuration (asegúrate de usar la misma configuración que en index.html)
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
const db = getFirestore(app); // Inicializa Firestore

document.addEventListener('DOMContentLoaded', function() {
    const registroAlumnoForm = document.querySelector('.registro-alumno-form');
    const registroResultadoDiv = document.getElementById('registro-resultado');

    const nombreAlumnoInput = document.getElementById('nombre-alumno');
    const apellidoAlumnoInput = document.getElementById('apellido-alumno');
    const nombreResponsableInput = document.getElementById('nombre-responsable');
    const parentescoResponsableInput = document.getElementById('parentesco-responsable');
    const telefonoResponsableInput = document.getElementById('telefono-responsable');

    const nombreAlumnoError = crearMensajeError(nombreAlumnoInput);
    const apellidoAlumnoError = crearMensajeError(apellidoAlumnoInput);
    const nombreResponsableError = crearMensajeError(nombreResponsableInput);
    const parentescoResponsableError = crearMensajeError(parentescoResponsableInput);
    const telefonoResponsableError = crearMensajeError(telefonoResponsableInput);

    function crearMensajeError(inputElement) {
        const errorElement = document.createElement('p');
        errorElement.style.color = 'red';
        inputElement.parentNode.appendChild(errorElement);
        return errorElement;
    }

    function formatearTelefono(telefono) {
        const cleaned = ('' + telefono).replace(/\D/g, '');
        const part1 = cleaned.slice(0, 4);
        const part2 = cleaned.slice(4, 8);
        let formatted = part1;
        if (part2) {
            formatted += `-${part2}`;
        }
        return formatted;
    }

    telefonoResponsableInput.addEventListener('input', function() {
        const formattedNumber = formatearTelefono(this.value);
        this.value = formattedNumber;
        if (this.value.length > 9) {
            this.value = this.value.slice(0, 9);
        }
    });

    if (registroAlumnoForm) {
        registroAlumnoForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            let isValid = true;

            // Validar Nombre del Alumno
            if (!nombreAlumnoInput.value.trim()) {
                nombreAlumnoError.textContent = 'Por favor, ingresa el nombre del alumno.';
                isValid = false;
            } else {
                nombreAlumnoError.textContent = '';
            }

            // Validar Apellido del Alumno
            if (!apellidoAlumnoInput.value.trim()) {
                apellidoAlumnoError.textContent = 'Por favor, ingresa el apellido del alumno.';
                isValid = false;
            } else {
                apellidoAlumnoError.textContent = '';
            }

            // Validar Nombre del Responsable
            if (!nombreResponsableInput.value.trim()) {
                nombreResponsableError.textContent = 'Por favor, ingresa el nombre del responsable.';
                isValid = false;
            } else {
                nombreResponsableError.textContent = '';
            }

            // Validar Parentesco del Responsable
            if (!parentescoResponsableInput.value.trim()) {
                parentescoResponsableError.textContent = 'Por favor, ingresa el parentesco del responsable.';
                isValid = false;
            } else {
                parentescoResponsableError.textContent = '';
            }

            // Validar Número de Teléfono del Responsable
            const telefonoSinGuion = telefonoResponsableInput.value.replace('-', '');
            if (!telefonoResponsableInput.value.trim()) {
                telefonoResponsableError.textContent = 'Por favor, ingresa el número de teléfono del responsable.';
                isValid = false;
            } else if (telefonoSinGuion.length !== 8) {
                telefonoResponsableError.textContent = 'El número de teléfono debe tener 8 dígitos (formato 0000-0000).';
                isValid = false;
            } else {
                telefonoResponsableError.textContent = '';
            }

            if (isValid) {
                const nombreAlumno = nombreAlumnoInput.value;
                const apellidoAlumno = apellidoAlumnoInput.value;
                const nombreResponsable = nombreResponsableInput.value;
                const parentescoResponsable = parentescoResponsableInput.value;
                const telefonoResponsable = telefonoResponsableInput.value;

                try {
                    const alumnosCollection = collection(db, 'alumnos');
                    await addDoc(alumnosCollection, {
                        nombre: nombreAlumno,
                        apellido: apellidoAlumno,
                        responsable: nombreResponsable,
                        parentesco: parentescoResponsable,
                        telefono: telefonoResponsable,
                        registradoPor: auth.currentUser.uid,
                        fechaRegistro: new Date()
                    });

                    console.log('Alumno registrado exitosamente!');
                    alert('Alumno registrado exitosamente!');
                    registroAlumnoForm.reset();
                    if (registroResultadoDiv) {
                        registroResultadoDiv.textContent = 'Alumno registrado exitosamente.';
                        registroResultadoDiv.className = 'success-message'; // Opcional: clase para estilos de éxito
                        setTimeout(() => {
                            registroResultadoDiv.textContent = '';
                            registroResultadoDiv.className = '';
                        }, 3000); // Limpiar mensaje después de 3 segundos
                    }

                } catch (error) {
                    console.error('Error al registrar alumno en Firestore:', error);
                    alert('Hubo un error al registrar al alumno. Por favor, inténtalo de nuevo.');
                    if (registroResultadoDiv) {
                        registroResultadoDiv.textContent = 'Error al registrar el alumno.';
                        registroResultadoDiv.className = 'error-message'; // Opcional: clase para estilos de error
                        setTimeout(() => {
                            registroResultadoDiv.textContent = '';
                            registroResultadoDiv.className = '';
                        }, 3000); // Limpiar mensaje después de 3 segundos
                    }
                }
            }
        });
    }
});