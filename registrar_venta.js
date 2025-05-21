import { initializeApp } from './firebase-config.js';
import { getFirestore, collection, doc, getDoc, addDoc, updateDoc, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js'; // Importa getAuth
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(); // Inicializa getAuth
const productosCollection = collection(db, 'productos');
const salesCollection = collection(db, 'ventas');

document.addEventListener('DOMContentLoaded', () => {
    const saleItemsDiv = document.getElementById('sale-items');
    const addItemButton = document.getElementById('add-item-button');
    const saleForm = document.getElementById('sale-form');
    const totalAmountSpan = document.getElementById('total-amount');

    let itemCount = 1;

    async function buscarProducto(codigo) {
        const q = query(productosCollection, where('codigo_producto', '==', codigo));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const producto = querySnapshot.docs[0].data();
            return { ...producto, id: querySnapshot.docs[0].id }; // Retornamos también el ID del documento
        } else {
            return null;
        }
    }

    function actualizarTotal() {
        const subtotales = document.querySelectorAll('.item-total span');
        let total = 0;
        subtotales.forEach(subtotal => {
            total += parseFloat(subtotal.textContent) || 0;
        });
        if (totalAmountSpan) {
            totalAmountSpan.textContent = `$${total.toFixed(2)}`;
        }
    }

    async function validarStock(inputElement, producto) {
        const cantidadVendida = parseInt(inputElement.value) || 0;
        const stockDisponible = producto ? producto.cantidad || 0 : 0;
        const mensajeError = inputElement.parentNode.querySelector('.stock-error');

        if (cantidadVendida > stockDisponible) {
            if (!mensajeError) {
                const errorDiv = document.createElement('div');
                errorDiv.classList.add('stock-error');
                errorDiv.style.color = 'red';
                errorDiv.textContent = `Stock insuficiente (${stockDisponible} disponibles)`;
                inputElement.parentNode.appendChild(errorDiv);
            } else {
                mensajeError.textContent = `Stock insuficiente (${stockDisponible} disponibles)`;
            }
            return false;
        } else {
            if (mensajeError) {
                mensajeError.remove();
            }
            return true;
        }
    }

    function crearNuevoItemVenta() {
        itemCount++;
        const newItem = document.querySelector('.sale-item').cloneNode(true);

        newItem.querySelectorAll('[id]').forEach(element => {
            const oldId = element.id;
            const newId = oldId.replace('-1', `-${itemCount}`);
            element.id = newId;
            if (element.tagName === 'LABEL' && element.getAttribute('for')) {
                element.setAttribute('for', newId);
            }
            if (element.tagName === 'INPUT' && element.type !== 'number') {
                element.value = '';
            } else if (element.tagName === 'INPUT' && element.type === 'number') {
                element.value = '';
            } else if (element.classList.contains('item-total')) {
                element.querySelector('span').textContent = '0.00';
            }
            const stockError = element.parentNode.querySelector('.stock-error');
            if (stockError) {
                stockError.remove();
            }
        });

        const productCodeInputNew = newItem.querySelector('.product-code-input');
        const quantityInputNew = newItem.querySelector('.quantity-input');

        if (productCodeInputNew) {
            productCodeInputNew.addEventListener('blur', async () => {
                const codigo = productCodeInputNew.value.trim();
                const item = productCodeInputNew.closest('.sale-item');
                const productNameInput = item.querySelector('.product-name-input');
                const priceInput = item.querySelector('.price-input');
                const quantityInput = item.querySelector('.quantity-input');
                const subtotalElement = item.querySelector('.item-total span');

                if (codigo) {
                    const producto = await buscarProducto(codigo);
                    if (producto) {
                        productNameInput.value = producto.nombre;
                        priceInput.value = producto.precio_venta ? parseFloat(producto.precio_venta).toFixed(2) : '';
                        if (quantityInput.value === '1' || quantityInput.value === '') {
                            quantityInput.value = 1;
                        }
                        subtotalElement.textContent = (parseFloat(priceInput.value) * parseInt(quantityInput.value)).toFixed(2);
                        actualizarTotal();
                        validarStock(quantityInput, producto);
                    } else {
                        productNameInput.value = '';
                        priceInput.value = '';
                        subtotalElement.textContent = '0.00';
                        actualizarTotal();
                        const stockError = quantityInput.parentNode.querySelector('.stock-error');
                        if (stockError) {
                            stockError.remove();
                        }
                    }
                } else {
                    productNameInput.value = '';
                    priceInput.value = '';
                    subtotalElement.textContent = '0.00';
                    actualizarTotal();
                    const stockError = quantityInput.parentNode.querySelector('.stock-error');
                    if (stockError) {
                        stockError.remove();
                    }
                }
            });
        }

        if (quantityInputNew) {
            quantityInputNew.addEventListener('input', async () => {
                const item = quantityInputNew.closest('.sale-item');
                const cantidadVendida = parseInt(quantityInputNew.value) || 0;
                const productCodeInput = item.querySelector('.product-code-input');
                const codigoProducto = productCodeInput.value.trim();
                const precioInput = item.querySelector('.price-input');
                const subtotalElement = item.querySelector('.item-total span');
                const precio = parseFloat(priceInput.value) || 0;
                subtotalElement.textContent = (precio * cantidadVendida).toFixed(2);
                actualizarTotal();

                if (codigoProducto) {
                    const productoInfo = await buscarProducto(codigoProducto);
                    validarStock(quantityInputNew, productoInfo);
                } else {
                    const mensajeError = quantityInputNew.parentNode.querySelector('.stock-error');
                    if (mensajeError) {
                        mensajeError.remove();
                    }
                }
            });
        }

        saleItemsDiv.appendChild(newItem);
    }

    if (addItemButton) {
        addItemButton.addEventListener('click', crearNuevoItemVenta);
    }

    // Event listeners para el primer item (ya existente en el HTML)
    const productCodeInput1 = document.getElementById('product-code-1');
    const quantityInput1 = document.getElementById('quantity-1');

    if (productCodeInput1) {
        productCodeInput1.addEventListener('blur', async () => {
            const codigo = productCodeInput1.value.trim();
            const item = productCodeInput1.closest('.sale-item');
            const productNameInput = item.querySelector('.product-name-input');
            const priceInput = item.querySelector('.price-input');
            const quantityInput = item.querySelector('.quantity-input');
            const subtotalElement = item.querySelector('.item-total span');

            if (codigo) {
                const producto = await buscarProducto(codigo);
                if (producto) {
                    productNameInput.value = producto.nombre;
                    priceInput.value = producto.precio_venta ? parseFloat(producto.precio_venta).toFixed(2) : '';
                    if (quantityInput.value === '1' || quantityInput.value === '') {
                        quantityInput.value = 1;
                    }
                    subtotalElement.textContent = (parseFloat(priceInput.value) * parseInt(quantityInput.value)).toFixed(2);
                    actualizarTotal();
                    validarStock(quantityInput, producto);
                } else {
                    productNameInput.value = '';
                    priceInput.value = '';
                    subtotalElement.textContent = '0.00';
                    actualizarTotal();
                    const stockError = quantityInput.parentNode.querySelector('.stock-error');
                    if (stockError) {
                        stockError.remove();
                    }
                }
            } else {
                productNameInput.value = '';
                priceInput.value = '';
                subtotalElement.textContent = '0.00';
                actualizarTotal();
                const stockError = quantityInput.parentNode.querySelector('.stock-error');
                if (stockError) {
                    stockError.remove();
                }
            }
        });
    }

    if (quantityInput1) {
        quantityInput1.addEventListener('input', async () => {
            const item = quantityInput1.closest('.sale-item');
            const cantidadVendida = parseInt(quantityInput1.value) || 0;
            const productCodeInput = item.querySelector('.product-code-input');
            const codigoProducto = productCodeInput.value.trim();
            const precioInput = item.querySelector('.price-input');
            const subtotalElement = item.querySelector('.item-total span');
            const precio = parseFloat(precioInput.value) || 0;
            subtotalElement.textContent = (precio * cantidadVendida).toFixed(2);
            actualizarTotal();

            if (codigoProducto) {
                const productoInfo = await buscarProducto(codigoProducto);
                validarStock(quantityInput1, productoInfo);
            } else {
                const mensajeError = quantityInput1.parentNode.querySelector('.stock-error');
                if (mensajeError) {
                    mensajeError.remove();
                }
            }
        });
    }

    actualizarTotal(); // Llamar al inicio para calcular el total inicial (si hay valores predefinidos)

    if (saleForm) {
        saleForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const saleItems = document.querySelectorAll('.sale-item');
            const itemsVendidos = [];
            let totalVenta = 0;
            const currentUser = auth.currentUser;
            let stockValido = true; // Variable para rastrear si el stock es válido para todos los items

            if (currentUser) {
                for (const item of saleItems) {
                    const codigo = item.querySelector('.product-code-input').value.trim();
                    const cantidad = parseInt(item.querySelector('.quantity-input').value);
                    const nombre = item.querySelector('.product-name-input').value.trim();
                    const precioUnitario = parseFloat(item.querySelector('.price-input').value);
                    const subtotal = parseFloat(item.querySelector('.item-total span').textContent);

                    if (codigo && cantidad > 0 && nombre && precioUnitario >= 0) {
                        const productoInfo = await buscarProducto(codigo);
                        if (productoInfo) {
                            if (cantidad > (productoInfo.cantidad || 0)) {
                                alert(`No hay suficiente stock para el producto "${nombre}" (código: ${codigo}). Stock disponible: ${productoInfo.cantidad || 0}`);
                                stockValido = false;
                                return; // Detener el registro de la venta si hay stock inválido
                            }
                            itemsVendidos.push({
                                codigo: codigo,
                                nombre: nombre,
                                cantidad: cantidad,
                                precio_unitario: precioUnitario
                            });
                            totalVenta += subtotal;
                        } else {
                            alert(`El producto con código "${codigo}" no se encontró.`);
                            return;
                        }
                    } else {
                        alert('Por favor, completa todos los campos del producto correctamente.');
                        return;
                    }
                }

                if (stockValido && itemsVendidos.length > 0) {
                    try {
                        const ventaRef = await addDoc(salesCollection, {
                            uid_usuario: currentUser.uid, // Asocia el UID del usuario a la venta
                            fecha: new Date(),
                            items: itemsVendidos,
                            total: totalVenta
                        });
                        console.log('Venta registrada con ID: ', ventaRef.id);
                        alert('Venta registrada exitosamente.');

                        for (const itemVendido of itemsVendidos) {
                            const productoRef = query(productosCollection, where('codigo_producto', '==', itemVendido.codigo));
                            const productoSnapshot = await getDocs(productoRef);
                            if (!productoSnapshot.empty) {
                                const productoDoc = productoSnapshot.docs[0];
                                const productoData = productoDoc.data();
                                const nuevoStock = productoData.cantidad - itemVendido.cantidad;
                                await updateDoc(doc(db, 'productos', productoDoc.id), {
                                    cantidad: nuevoStock >= 0 ? nuevoStock : 0
                                });
                                console.log(`Inventario de ${itemVendido.nombre} actualizado. Nuevo stock: ${nuevoStock}`);
                            } else {
                                console.error(`Producto con código ${itemVendido.codigo} no encontrado en el inventario.`);
                            }
                        }

                        saleForm.reset();
                        actualizarTotal(); // Reiniciar el total visualmente
                        itemCount = 1; // Reiniciar el contador de items
                        // Limpiar todos los items excepto el primero
                        while (saleItemsDiv.children.length > 1) {
                            saleItemsDiv.removeChild(saleItemsDiv.lastChild);
                        }
                        const firstSubtotal = document.getElementById('subtotal-1');
                        if (firstSubtotal) {
                            firstSubtotal.textContent = '0.00';
                        }

                    } catch (error) {
                        console.error('Error al registrar la venta: ', error);
                        alert('Error al registrar la venta.');
                    }
                } else if (itemsVendidos.length === 0) {
                    alert('No hay productos para registrar en la venta.');
                }
            } else {
                alert('Usuario no autenticado. No se puede registrar la venta.');
            }
        });
    }
});