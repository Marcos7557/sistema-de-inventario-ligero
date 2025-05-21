import { getAuth, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { app } from './firebase-config.js'; // Importa la instancia de la aplicación

const auth = getAuth(app);
const forgotPasswordForm = document.getElementById('forgot-password-form');

forgotPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;

    try {
        await sendPasswordResetEmail(auth, email);
        alert('Se ha enviado un correo electrónico de restablecimiento a tu dirección.');
        // Puedes redirigir al usuario a una página de confirmación si lo deseas
    } catch (error) {
        console.error("Error al enviar el correo de restablecimiento: ", error);
        let errorMessage = 'Error al enviar el correo de restablecimiento.';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No hay ninguna cuenta de usuario que coincida con este correo electrónico.';
        }
        alert(errorMessage);
    }
});