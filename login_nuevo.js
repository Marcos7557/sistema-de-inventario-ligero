import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { app } from './firebase-config.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const successMessage = document.createElement('div');
    successMessage.style.position = 'fixed';
    successMessage.style.top = '50%';
    successMessage.style.left = '50%';
    successMessage.style.transform = 'translate(-50%, -50%)';
    successMessage.style.backgroundColor = '#4CAF50'; // Cambiamos el color a verde (puedes usar otro)
    successMessage.style.color = 'white';
    successMessage.style.padding = '20px';
    successMessage.style.borderRadius = '8px';
    successMessage.style.zIndex = '1000';
    successMessage.style.display = 'none';
    document.body.appendChild(successMessage);

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const emailInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const email = emailInput.value;
            const password = passwordInput.value;

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Obtener el documento del usuario desde Firestore para obtener el nombre
                const userDocRef = doc(db, 'users', user.uid); // Asumiendo que tienes una colección 'users' con el uid como ID
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists() && userDocSnap.data().nombre) {
                    successMessage.textContent = '¡Bienvenido, ' + userDocSnap.data().nombre + '!';
                } else {
                    successMessage.textContent = 'Inicio de sesión exitoso.'; // Si no se encuentra el nombre
                }

                successMessage.style.display = 'block';

                setTimeout(() => {
                    window.location.href = 'inventario.html';
                }, 2000);

                console.log('Inicio de sesión exitoso:', user);

            } catch (error) {
                let errorMessage = 'Error al iniciar sesión.';
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    errorMessage = 'Correo electrónico o contraseña incorrectos.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Formato de correo electrónico inválido.';
                }
                alert('Error al iniciar sesión: ' + errorMessage);
                console.error('Error al iniciar sesión:', error.code, error.message);
            }
        });
    } else {
        console.error('No se encontró el formulario de inicio de sesión.');
    }
});