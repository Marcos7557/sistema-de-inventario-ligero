import { auth } from './firebase-config.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const confirmPasswordInput = document.getElementById('confirm-password');
            const email = emailInput.value;
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden.');
                return;
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                console.log('Registro exitoso:', user);

                const messageDiv = document.getElementById('registration-message');
                if (messageDiv) {
                    messageDiv.textContent = 'Registro exitoso. Serás redirigido a la página de inventario en 3 segundos...';
                    messageDiv.style.display = 'block'; // Mostrar el mensaje
                    setTimeout(() => {
                        window.location.href = 'inventario.html'; // Redirigir a inventario.html
                    }, 3000);
                } else {
                    window.location.href = 'inventario.html'; // Redirigir a inventario.html si no se encuentra el div (fallback)
                }

            } catch (error) {
                console.error('Error al registrar usuario:', error.code, error.message);
                alert('Error al registrar usuario: ' + error.message); // Puedes manejar errores de forma más elegante también
            }
        });
    }
});