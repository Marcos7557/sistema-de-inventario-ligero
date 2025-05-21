import { initializeApp } from './firebase-config.js';
import { getFirestore, collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';
import { getAuth, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const productosCollection = collection(db, 'productos');

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-button');
    const inventoryList = document.getElementById('inventory-list');

    const cargarInventario = async (uidUsuario) => {
        if (uidUsuario && inventoryList) {
            const q = query(productosCollection, where('uid_usuario', '==', uidUsuario));
            try {
                const querySnapshot = await getDocs(q);
                inventoryList.innerHTML = ''; // Limpiar la lista anterior
                querySnapshot.forEach((doc) => {
                    const producto = doc.data();
                    const listItem = document.createElement('div');
                    listItem.textContent = `${producto.nombre} - Precio Compra: $${producto.precio_compra.toFixed(2)} - Precio Venta: $${producto.precio_venta.toFixed(2)} - Cantidad: ${producto.cantidad} - Código: ${producto.codigo_producto}`;
                    inventoryList.appendChild(listItem);
                });
            } catch (error) {
                console.error('Error al cargar el inventario:', error);
                alert('Error al cargar el inventario.');
            }
        } else if (!inventoryList) {
            console.log('No se encontró el elemento para mostrar el inventario.');
        }
    };

    const verificarAutenticacion = () => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // El usuario está autenticado, cargar el inventario
                console.log('Usuario autenticado:', user.uid);
                cargarInventario(user.uid);
            } else {
                // El usuario no está autenticado, redirigir al inicio de sesión
                console.log('Usuario no autenticado. Redirigiendo al inicio de sesión.');
                window.location.href = 'index.html';
            }
        });
    };

    // Verificar la autenticación al cargar la página
    verificarAutenticacion();

    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                await signOut(auth);
                console.log('Cierre de sesión exitoso');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
                alert('Error al cerrar sesión.');
            }
        });
    }
});