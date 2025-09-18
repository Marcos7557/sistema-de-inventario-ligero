// Importa la función para inicializar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
// Importa los servicios que vas a utilizar (en este caso, auth)
import { getAuth, confirmPasswordReset, verifyPasswordResetCode } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

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
        const newPasswordField = document.getElementById('newPassword');
        const confirmNewPasswordField = document.getElementById('confirmNewPassword');
        const resetButton = document.getElementById('resetPasswordButton');
        const resetPasswordMessage = document.getElementById('resetPasswordMessage');
        const backToLoginLink = document.getElementById('backToLogin');

        // Obtener el código de restablecimiento de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const oobCode = urlParams.get('oobCode');

        if (oobCode) {
            // Verificar si el código es válido (opcional, pero recomendado)
            verifyPasswordResetCode(auth, oobCode)
                .then(() => {
                    console.log("Código de restablecimiento de contraseña válido.");
                    // El formulario para la nueva contraseña estará visible
                })
                .catch((error) => {
                    console.error("Código de restablecimiento de contraseña inválido o expirado:", error);
                    resetPasswordMessage.textContent = "El enlace de restablecimiento de contraseña no es válido o ha expirado.";
                    resetPasswordMessage.className = 'error-message';
                    // Ocultar el formulario de nueva contraseña
                    const passwordForm = document.querySelector('.password-form');
                    if (passwordForm) {
                        passwordForm.style.display = 'none';
                    }
                });

            resetButton.addEventListener('click', () => {
                const newPassword = newPasswordField.value;
                const confirmNewPassword = confirmNewPasswordField.value;

                if (newPassword && confirmNewPassword && newPassword === confirmNewPassword) {
                    confirmPasswordReset(auth, oobCode, newPassword)
                        .then((resp) => {
                            console.log("Contraseña restablecida con éxito:", resp);
                            resetPasswordMessage.textContent = "Tu contraseña ha sido restablecida con éxito. Serás redirigido para iniciar sesión.";
                            resetPasswordMessage.className = 'success-message';
                            setTimeout(() => {
                                window.location.href = 'index.html'; // Redirigir a la página de inicio de sesión
                            }, 3000); // Redirigir después de 3 segundos
                        })
                        .catch((error) => {
                            console.error("Error al restablecer la contraseña:", error);
                            resetPasswordMessage.textContent = `Error al restablecer la contraseña: ${error.message}`;
                            resetPasswordMessage.className = 'error-message';
                        });
                } else {
                    resetPasswordMessage.textContent = "Las contraseñas no coinciden o están vacías.";
                    resetPasswordMessage.className = 'error-message';
                }
            });

            if (backToLoginLink) {
                backToLoginLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = 'index.html';
                });
            }

        } else {
            resetPasswordMessage.textContent = "No se encontró un código de restablecimiento válido en la URL.";
            resetPasswordMessage.className = 'error-message';
            // Ocultar el formulario de nueva contraseña
            const passwordForm = document.querySelector('.password-form');
            if (passwordForm) {
                passwordForm.style.display = 'none';
            }
        }
    });

} catch (error) {
    console.error("Error al inicializar Firebase:", error);
    // Puedes mostrar un mensaje de error en la UI si lo deseas
}