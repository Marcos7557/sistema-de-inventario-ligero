import { initializeApp } from './firebase-config.js';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';//se agrego , getDocs, query, where, updateDoc, doc 
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
    // Referencias a elementos del modal para "Código Existente"
    const btnCodigoExistente = document.getElementById('btnCodigoExistente');
    const modalCodigoExistente = document.getElementById('modalCodigoExistente');
    const closeButtonModal = modalCodigoExistente.querySelector('.close-button');
    const formAumentarCantidad = document.getElementById('formAumentarCantidad');
    const modalCodigoInput = document.getElementById('modalCodigo');
    const modalCantidadInput = document.getElementById('modalCantidad');

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
    // INICIO: Lógica para el modal "Código Existente"

// Event listener para abrir el modal
if (btnCodigoExistente) {
    btnCodigoExistente.addEventListener('click', () => {
        modalCodigoExistente.style.display = 'flex'; // Usamos 'flex' para centrar
        modalCodigoInput.focus(); // Pone el foco en el campo de código
    });
}

// Event listener para cerrar el modal con el botón 'x'
if (closeButtonModal) {
    closeButtonModal.addEventListener('click', () => {
        modalCodigoExistente.style.display = 'none';
        formAumentarCantidad.reset(); // Limpia el formulario del modal al cerrar
    });
}

// Event listener para cerrar el modal si se hace clic fuera del contenido
if (modalCodigoExistente) {
    window.addEventListener('click', (event) => {
        if (event.target === modalCodigoExistente) {
            modalCodigoExistente.style.display = 'none';
            formAumentarCantidad.reset(); // Limpia el formulario del modal al cerrar
        }
    });
}

// FIN: Lógica para el modal "Código Existente"
// INICIO: Lógica para aumentar cantidad de producto existente

if (formAumentarCantidad) {
    formAumentarCantidad.addEventListener('submit', async (event) => {
        event.preventDefault();

        const codigoAumentar = modalCodigoInput.value.trim();
        const cantidadAumentar = parseInt(modalCantidadInput.value);

        // Validaciones básicas
        if (!codigoAumentar) {
            alert('Por favor, ingresa el código del producto.');
            return;
        }
        if (isNaN(cantidadAumentar) || cantidadAumentar <= 0) {
            alert('Por favor, ingresa una cantidad válida a añadir (mayor que 0).');
            return;
        }

        const currentUser = auth.currentUser;
        let uidUsuario = null;
        if (currentUser) {
            uidUsuario = currentUser.uid;
        } else {
            console.error('Usuario no autenticado para aumentar cantidad.');
            alert('Debes estar autenticado para aumentar la cantidad de productos.');
            return;
        }

        try {
            // Crear una consulta para buscar el producto por código y UID de usuario
            const q = query(
                productosCollection,
                where('codigo_producto', '==', codigoAumentar),
                where('uid_usuario', '==', uidUsuario) // Asegura que solo actualiza productos del usuario actual
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Si se encuentra el producto, actualiza su cantidad
                const productDoc = querySnapshot.docs[0]; // Obtiene el primer documento encontrado
                const currentCantidad = productDoc.data().cantidad || 0; // Cantidad actual, por si no existe
                const newCantidad = currentCantidad + cantidadAumentar;

                const productRef = doc(db, 'productos', productDoc.id);
                await updateDoc(productRef, {
                    cantidad: newCantidad,
                    timestamp: new Date() // Opcional: actualizar la fecha de modificación
                });

                alert(`Cantidad de "${productDoc.data().nombre}" (código: ${codigoAumentar}) actualizada a ${newCantidad}.`);
                formAumentarCantidad.reset(); // Limpia el formulario del modal
                modalCodigoExistente.style.display = 'none'; // Cierra el modal
            } else {
                alert(`Producto con código "${codigoAumentar}" no encontrado para tu usuario.`);
            }
        } catch (error) {
            console.error('Error al aumentar cantidad del producto:', error);
            alert('Hubo un error al aumentar la cantidad. Inténtalo de nuevo.');
        }
    });
}

// FIN: Lógica para aumentar cantidad de producto existente
});