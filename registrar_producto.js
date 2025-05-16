import { initializeApp } from './firebase-config.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js'; // Importa getAuth y onAuthStateChanged
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Inicializa el objeto de autenticación
const productosCollection = collection(db, 'productos');

document.addEventListener('DOMContentLoaded', () => {
    const addProductForm = document.getElementById('add-product-form');
    const productCodeInput = document.getElementById('product-code');
    const productNameInput = document.getElementById('product-name');
    const buyPriceInput = document.getElementById('buy-price');
    const sellPriceInput = document.getElementById('sell-price');
    const successMessageDiv = document.getElementById('success-message');

    // Función para generar el código del producto (sin cambios)
    const generateProductCode = (productName) => {
        if (!productName) {
            return '';
        }
        const firstThreeLetters = productName.substring(0, 3).toUpperCase();
        const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${firstThreeLetters}${randomNumber}`;
    };

    // Generar código al cambiar el nombre del producto (sin cambios)
    if (productNameInput && productCodeInput) {
        productNameInput.addEventListener('input', () => {
            productCodeInput.value = generateProductCode(productNameInput.value);
        });
        productCodeInput.value = generateProductCode(productNameInput.value);
    }

    // Función para obtener el valor numérico del precio (sin cambios)
    const getNumericPriceValue = (input) => {
        const value = input.value.replace('$', '');
        return parseFloat(value) || 0;
    };

    // Event listener para el formulario de guardar producto
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const nombre = productNameInput.value;
            const precioCompra = getNumericPriceValue(buyPriceInput);
            const cantidad = parseInt(document.getElementById('quantity').value);
            const precioVenta = getNumericPriceValue(sellPriceInput);
            const codigoProducto = productCodeInput.value;

            buyPriceInput.value = '$' + (isNaN(precioCompra) ? '' : precioCompra.toFixed(2));
            sellPriceInput.value = '$' + (isNaN(precioVenta) ? '' : precioVenta.toFixed(2));

            // Obtener el UID del usuario actualmente autenticado
            const currentUser = auth.currentUser;
            let uidUsuario = null;
            if (currentUser) {
                uidUsuario = currentUser.uid;
            } else {
                console.error('Usuario no autenticado.');
                alert('Debes estar autenticado para guardar productos.');
                return; // Detener el proceso si no hay usuario autenticado
            }

            if (nombre && !isNaN(precioCompra) && !isNaN(cantidad) && !isNaN(precioVenta) && codigoProducto && uidUsuario) {
                try {
                    const docRef = await addDoc(productosCollection, {
                        nombre: nombre,
                        precio_compra: precioCompra,
                        cantidad: cantidad,
                        precio_venta: precioVenta,
                        codigo_producto: codigoProducto,
                        timestamp: new Date(),
                        uid_usuario: uidUsuario // Agregar el UID del usuario
                    });
                    console.log('Producto agregado con ID:', docRef.id, 'por el usuario:', uidUsuario);

                    if (successMessageDiv) {
                        successMessageDiv.textContent = 'Producto guardado exitosamente.';
                        successMessageDiv.style.display = 'block';
                        setTimeout(() => {
                            successMessageDiv.style.display = 'none';
                            addProductForm.reset();
                            productCodeInput.value = generateProductCode('');
                            productNameInput.focus();
                        }, 1000);
                    }

                } catch (error) {
                    console.error('Error al agregar producto:', error);
                    alert('Error al guardar el producto.');
                }
            } else {
                alert('Por favor, completa todos los campos correctamente.');
            }
        });
    }
});