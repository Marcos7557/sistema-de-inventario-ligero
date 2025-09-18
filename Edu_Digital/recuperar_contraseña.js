// Importa la función para inicializar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
// Importa los servicios que vas a utilizar (en este caso, auth)
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Tu objeto de configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBxLwqastV6BQQk8da87hYxfBN2XRK-dq4",
    authDomain: "edudigital-3d1f6.firebaseapp.com",
    projectId: "edudigital-3d1f6",
    storageBucket: "edudigital-3d1f6.firebasestorage.app",
    messagingSenderId: "850487616745",
    appId: "1:850487616745:web:101a73670513a79ec83c78",
    measurementId: "G-344RK6CZPP"
};

// Inicializa la aplicación de Firebase
try {
    const app = initializeApp(firebaseConfig);
    // Obtén la instancia de Firebase Authentication
    const auth = getAuth(app);

    document.addEventListener('DOMContentLoaded', () => {
        const sendResetEmailButton = document.getElementById('sendResetEmail');
        const resetEmailInput = document.getElementById('resetEmail');
        const resetPasswordMessage = document.getElementById('resetPasswordMessage');
        const backToLoginButton = document.getElementById('backToLogin');

        if (sendResetEmailButton && resetEmailInput && resetPasswordMessage && backToLoginButton) {
            sendResetEmailButton.addEventListener('click', async () => {
                const email = resetEmailInput.value;
                if (email) {
                    const actionCodeSettings = {
                        url: window.location.origin + '/restablecer_contraseña.html', // URL de tu página de restablecimiento
                        handleCodeInApp: false // La acción se maneja fuera de la app (en la web)
                    };
                    try {
                        await sendPasswordResetEmail(auth, email, actionCodeSettings);
                        resetPasswordMessage.textContent = 'Se ha enviado un correo electrónico de restablecimiento a tu dirección. Sigue el enlace para restablecer tu contraseña.';
                        resetPasswordMessage.className = 'success-message';
                    } catch (error) {
                        console.error("Error al enviar el correo de restablecimiento:", error);
                        resetPasswordMessage.textContent = `Error al enviar el correo: ${error.message}`;
                        resetPasswordMessage.className = 'error-message';
                    }
                } else {
                    resetPasswordMessage.textContent = 'Por favor, ingresa tu correo electrónico.';
                    resetPasswordMessage.className = 'error-message';
                }
            });

            backToLoginButton.addEventListener('click', () => {
                window.location.href = 'index.html'; // Redirige de vuelta a la página de inicio de sesión
            });
        } else {
            console.error('Uno o más elementos del DOM no se encontraron en recuperar_contraseña.html');
        }
    });

} catch (error) {
    console.error("Error al inicializar Firebase:", error);
    // Puedes mostrar un mensaje de error en la UI si lo deseas
}