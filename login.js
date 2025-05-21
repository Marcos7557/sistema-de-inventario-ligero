import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { app } from './firebase-config.js'; // Importa la instancia de la aplicación

const auth = getAuth(app); // Inicializa 'auth' aquí, después de importar 'app'

// Configurar la persistencia de la sesión al inicio
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log('login.js: Persistencia de autenticación configurada a browserLocalPersistence');
        // El resto del código de inicio de sesión va aquí
        document.addEventListener('DOMContentLoaded', () => {
            const loginForm = document.getElementById('login-form');
            const googleLoginButton = document.querySelector('.google-login');

            if (loginForm) {
                console.log('login.js: Formulario de inicio de sesión encontrado. Agregando event listener...');
                loginForm.addEventListener('submit', async (event) => {
                    event.preventDefault();
                    console.log('login.js: Formulario de inicio de sesión enviado.');
                    const emailInput = document.getElementById('username');
                    const passwordInput = document.getElementById('password');
                    const email = emailInput.value;
                    const password = passwordInput.value;

                    console.log('login.js: Correo:', email);
                    console.log('login.js: Contraseña:', password);

                    try {
                        const userCredential = await signInWithEmailAndPassword(auth, email, password);
                        const user = userCredential.user;
                        console.log('login.js: Inicio de sesión exitoso:', user);
                        console.log('login.js: Objeto de usuario:', user); // Agregado
                        window.location.href = 'inventario.html';
                    } catch (error) {
                        console.error('login.js: Error al iniciar sesión:', error.code, error.message);
                        alert('login.js: Error al iniciar sesión: ' + error.message);
                    }
                });
            }

            if (googleLoginButton) {
                console.log('login.js: Botón de Google encontrado. Agregando event listener...');
                googleLoginButton.addEventListener('click', async () => {
                    const provider = new GoogleAuthProvider();
                    console.log('login.js: Iniciando inicio de sesión con Google...');
                    try {
                        const result = await signInWithPopup(auth, provider);
                        const user = result.user;
                        const credential = GoogleAuthProvider.credentialFromResult(result);
                        const token = credential?.accessToken;
                        console.log('login.js: Inicio de sesión con Google exitoso:', user, token);
                        window.location.href = 'inventario.html';
                    } catch (error) {
                        console.error('login.js: Error al iniciar sesión con Google:', error.code, error.message);
                        alert('login.js: Error al iniciar sesión con Google: ' + error.message);
                    }
                });
            } else {
                console.log('login.js: Botón de Google NO encontrado.');
            }
        });
    })
    .catch((error) => {
        console.error('login.js: Error al configurar la persistencia:', error.code, error.message);
        alert('login.js: Error al configurar la persistencia: ' + error.message);
    });