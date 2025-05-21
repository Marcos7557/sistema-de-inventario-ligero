import { initializeApp } from './firebase-config.js';
import { getFirestore, collection, getDocs, query, where, deleteDoc } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js'; // Importamos onAuthStateChanged
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const productosCollection = collection(db, 'productos');
const inventoryListDiv = document.getElementById('inventory-list');
const eliminarProductoTopBtn = document.getElementById('eliminarProductoTopBtn'); // Obtenemos el botón "Eliminar Producto" superior

document.addEventListener('DOMContentLoaded', () => {
    // Verificar el estado de autenticación al cargar la página
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuario autenticado: cargar el inventario
            loadInventory();
        } else {
            // Usuario no autenticado: redirigir a la página de inicio de sesión
            console.log('Usuario no autenticado. Redirigiendo a index.html');
            window.location.href = 'index.html';
            inventoryListDiv.innerHTML = '<p class="error-message">Usuario no autenticado. Inicie sesión para ver el inventario.</p>'; // Podemos poner el mensaje aquí también
        }
    });

    // Añadimos el event listener al botón "Eliminar Producto" superior
    eliminarProductoTopBtn.addEventListener('click', () => {
        const codigoProductoAEliminar = prompt('Por favor, ingresa el código del producto que deseas eliminar:');

        if (codigoProductoAEliminar) {
            const confirmarEliminacion = confirm(`¿Estás seguro de que deseas eliminar el producto con código: ${codigoProductoAEliminar}?`);
            if (confirmarEliminacion) {
                eliminarProductoPorCodigo(codigoProductoAEliminar);
            }
        } else {
            alert('No se ingresó ningún código de producto.');
        }
    });
});

async function loadInventory() {
    try {
        const currentUser = auth.currentUser;

        if (currentUser) {
            const q = query(productosCollection, where('uid_usuario', '==', currentUser.uid));
            const querySnapshot = await getDocs(q);

            let inventoryHTML = '<table class="inventory-table"><thead><tr><th>Código</th><th>Nombre</th><th>Precio de Compra</th><th>Precio de Venta</th><th>Cantidad</th><th>Sin Stock</th></tr></thead><tbody>';
            querySnapshot.forEach((doc) => {
                const producto = doc.data();
                const cantidad = producto.cantidad || 0;
                const sinStock = cantidad === 0 ? 'Sí' : 'No';

                inventoryHTML += `
                    <tr>
                        <td data-label="Código">${producto.codigo_producto}</td>
                        <td data-label="Nombre">${producto.nombre}</td>
                        <td data-label="Precio de Compra">$${producto.precio_compra ? producto.precio_compra.toFixed(2) : 'N/A'}</td>
                        <td data-label="Precio de Venta">$${producto.precio_venta ? producto.precio_venta.toFixed(2) : 'N/A'}</td>
                        <td data-label="Cantidad">${cantidad}</td>
                        <td data-label="Sin Stock">${sinStock}</td>
                    </tr>
                `;
            });
            inventoryHTML += '</tbody></table>';
            inventoryListDiv.innerHTML = inventoryHTML;
        } else {
            inventoryListDiv.innerHTML = '<p class="error-message">Usuario no autenticado. Inicie sesión para ver el inventario.</p>'; // Podemos poner el mensaje aquí también
        }
    } catch (error) {
        console.error('Error al cargar el inventario:', error);
        inventoryListDiv.innerHTML = '<p class="error-message">Error al cargar el inventario.</p>';
    }
}

async function eliminarProductoPorCodigo(codigoProducto) {
    const productosCollection = collection(db, 'productos');
    const q = query(productosCollection, where('codigo_producto', '==', codigoProducto));

    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
                alert(`Producto con código "${codigoProducto}" eliminado correctamente.`);
                loadInventory(); // Recargar el inventario después de eliminar
            });
        } else {
            alert(`No se encontró ningún producto con el código "${codigoProducto}".`);
        }
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        alert(`Error al eliminar el producto con código "${codigoProducto}": ${error.message}`);
    }
}