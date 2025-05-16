// Importaciones de Firebase (sin cambios)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Configuración de Firebase (sin cambios)
const firebaseConfig = {
    apiKey: "AIzaSyBxLwqastV6BQQk8da87hYxfBN2XRK-dq4",
    authDomain: "edudigital-3d1f6.firebaseapp.com",
    projectId: "edudigital-3d1f6",
    storageBucket: "edudigital-3d1f6.firebasestorage.app",
    messagingSenderId: "850487616745",
    appId: "1:850487616745:web:101a73670513a79ec83c78",
    measurementId: "G-344RK6CZPP"
};

// Inicialización de Firebase (sin cambios)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elementos del DOM
const registrationForm = document.getElementById('registration-form');
const nombreInput = document.getElementById('nombre-maestro');
const apellidoInput = document.getElementById('apellido-maestro');
const emailInput = document.getElementById('email-maestro');
const passwordInput = document.getElementById('password-maestro');
const telefonoInput = document.getElementById('telefono-maestro');
const institucionInput = document.getElementById('institucion-maestro');

const nombreError = crearMensajeError(nombreInput);
const apellidoError = crearMensajeError(apellidoInput);
const emailError = crearMensajeError(emailInput);
const passwordError = crearMensajeError(passwordInput);
const telefonoError = crearMensajeError(telefonoInput);
const institucionError = crearMensajeError(institucionInput);

function crearMensajeError(inputElement) {
    const errorElement = document.createElement('p');
    errorElement.style.color = 'red';
    inputElement.parentNode.appendChild(errorElement);
    return errorElement;
}

function validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

telefonoInput.addEventListener('input', function() {
    const formattedNumber = formatearTelefono(this.value);
    this.value = formattedNumber;
    // Limitar la longitud total a 9 caracteres (8 dígitos + 1 guion)
    if (this.value.length > 9) {
        this.value = this.value.slice(0, 9);
    }
});

if (registrationForm) {
    registrationForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        let isValid = true;

        // Validar Nombre
        if (!nombreInput.value.trim()) {
            nombreError.textContent = 'Por favor, ingresa tu nombre.';
            isValid = false;
        } else {
            nombreError.textContent = '';
        }

        // Validar Apellido
        if (!apellidoInput.value.trim()) {
            apellidoError.textContent = 'Por favor, ingresa tu apellido.';
            isValid = false;
        } else {
            apellidoError.textContent = '';
        }

        // Validar Correo Electrónico
        if (!emailInput.value.trim()) {
            emailError.textContent = 'Por favor, ingresa tu correo electrónico.';
            isValid = false;
        } else if (!validarEmail(emailInput.value)) {
            emailError.textContent = 'Por favor, ingresa un correo electrónico válido (ejemplo@dominio.com).';
            isValid = false;
        } else {
            emailError.textContent = '';
        }

        // Validar Contraseña
        if (passwordInput.value.length < 6) {
            passwordError.textContent = 'La contraseña debe tener al menos 6 caracteres.';
            isValid = false;
        } else {
            passwordError.textContent = '';
        }

        // Validar Número de Teléfono
        const telefonoSinGuion = telefonoInput.value.replace('-', '');
        if (!telefonoInput.value.trim()) {
            telefonoError.textContent = 'Por favor, ingresa tu número de teléfono.';
            isValid = false;
        } else if (telefonoSinGuion.length !== 8) {
            telefonoError.textContent = 'El número de teléfono debe tener 8 dígitos (formato 0000-0000).';
            isValid = false;
        } else {
            telefonoError.textContent = '';
        }

        // Validar Institución Educativa
        if (!institucionInput.value.trim()) {
            institucionError.textContent = 'Por favor, ingresa el nombre de tu institución educativa.';
            isValid = false;
        } else {
            institucionError.textContent = '';
        }

        if (isValid) {
            const email = emailInput.value;
            const password = passwordInput.value;
            const nombre = nombreInput.value.trim();
            const apellido = apellidoInput.value.trim();
            const telefono = telefonoInput.value.trim();
            const institucion = institucionInput.value.trim();

            try {
                console.log('Intentando registrar maestro con:', { email, password });
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Guardar información adicional en Firestore
                const db = getFirestore(app);
                const maestrosCollection = collection(db, 'maestros');
                await addDoc(maestrosCollection, {
                    uid: user.uid,
                    nombre: nombre,
                    apellido: apellido,
                    telefono: telefono,
                    institucion: institucion,
                    email: email,
                    fechaRegistro: new Date()
                });

                console.log('Maestro registrado y datos guardados en Firestore:', user);
                registrationForm.reset();
                window.location.href = 'maestro.html';
            } catch (error) {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Error al registrar maestro:', error);
                // Aquí podrías mostrar otros mensajes de error de Firebase al usuario
            }
        }
    });
}