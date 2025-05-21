import { initializeApp } from './firebase-config.js';
import { getFirestore, collection, getDocs, orderBy, query, where } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js'; // Importa onAuthStateChanged
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const ventasCollection = collection(db, 'ventas');
const historialVentasDiv = document.getElementById('historial-ventas-list');
const totalVentasContainer = document.getElementById('total-ventas-container');
const filtroFechaSelect = document.getElementById('filtro-fecha');
const fechaEspecificaControles = document.getElementById('fecha-especifica-Controles');
const mesEspecificoControles = document.getElementById('mes-especifico-Controles');
const anioEspecificoControles = document.getElementById('anio-especifico-Controles');
const rangoFechasControles = document.getElementById('rango-fechas-Controles');
const fechaDiaInput = document.getElementById('fecha-dia');
const fechaMesInput = document.getElementById('fecha-mes');
const fechaAnioInput = document.getElementById('fecha-anio');
const fechaInicioInput = document.getElementById('fecha-inicio');
const fechaFinInput = document.getElementById('fecha-fin');
const aplicarFiltroFechaBtn = document.getElementById('aplicar-filtro-fecha');
const filtroProductoSelect = document.getElementById('filtro-producto');
const auth = getAuth();

let historialVentasCache = []; // Almacena todas las ventas cargadas para filtrar en el cliente

document.addEventListener('DOMContentLoaded', () => {
    if (historialVentasDiv && totalVentasContainer && filtroFechaSelect && filtroProductoSelect) {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                loadHistorialVentas(user);
                setupFiltroFecha();
                setupFiltroProducto();
            } else {
                historialVentasDiv.innerHTML = '<p class="error-message">Usuario no autenticado.</p>';
                totalVentasContainer.innerHTML = '';
            }
        });
    }
});

function setupFiltroFecha() {
    filtroFechaSelect.addEventListener('change', () => {
        fechaEspecificaControles.style.display = 'none';
        mesEspecificoControles.style.display = 'none';
        anioEspecificoControles.style.display = 'none';
        rangoFechasControles.style.display = 'none';

        const filtroSeleccionado = filtroFechaSelect.value;
        if (filtroSeleccionado === 'dia') {
            fechaEspecificaControles.style.display = 'flex';
        } else if (filtroSeleccionado === 'mes') {
            mesEspecificoControles.style.display = 'flex';
        } else if (filtroSeleccionado === 'anio') {
            anioEspecificoControles.style.display = 'flex';
        } else if (filtroSeleccionado === 'rango') {
            rangoFechasControles.style.display = 'flex';
        } else {
            mostrarHistorialFiltrado(historialVentasCache); // Mostrar todos si se selecciona "Todos"
        }
    });

    aplicarFiltroFechaBtn.addEventListener('click', () => {
        const filtroSeleccionado = filtroFechaSelect.value;
        let ventasFiltradas = [];

        if (filtroSeleccionado === 'dia' && fechaDiaInput.value) {
            const fechaFiltro = new Date(fechaDiaInput.value).toLocaleDateString();
            ventasFiltradas = historialVentasCache.filter(venta => {
                const fechaVenta = new Date(venta.fecha.seconds * 1000).toLocaleDateString();
                return fechaVenta === fechaFiltro;
            });
        } else if (filtroSeleccionado === 'mes' && fechaMesInput.value) {
            const [anio, mes] = fechaMesInput.value.split('-');
            ventasFiltradas = historialVentasCache.filter(venta => {
                const fechaVenta = new Date(venta.fecha.seconds * 1000);
                return fechaVenta.getFullYear() === parseInt(anio) && fechaVenta.getMonth() + 1 === parseInt(mes);
            });
        } else if (filtroSeleccionado === 'anio' && fechaAnioInput.value) {
            const anioFiltro = parseInt(fechaAnioInput.value);
            ventasFiltradas = historialVentasCache.filter(venta => {
                const fechaVenta = new Date(venta.fecha.seconds * 1000);
                return fechaVenta.getFullYear() === anioFiltro;
            });
        } else if (filtroSeleccionado === 'rango' && fechaInicioInput.value && fechaFinInput.value) {
            const inicioFiltro = new Date(fechaInicioInput.value);
            const finFiltro = new Date(fechaFinInput.value);
            ventasFiltradas = historialVentasCache.filter(venta => {
                const fechaVenta = new Date(venta.fecha.seconds * 1000);
                return fechaVenta >= inicioFiltro && fechaVenta <= finFiltro;
            });
        } else if (filtroSeleccionado === '') {
            ventasFiltradas = historialVentasCache; // Mostrar todos
        }

        mostrarHistorialFiltrado(ventasFiltradas);
    });
}

function setupFiltroProducto() {
    filtroProductoSelect.addEventListener('change', () => {
        const productoFiltro = filtroProductoSelect.value;
        let ventasFiltradas = [];

        if (productoFiltro) {
            ventasFiltradas = historialVentasCache.filter(venta => {
                return venta.items.some(item => item.nombre.toLowerCase().includes(productoFiltro.toLowerCase()));
            });
        } else {
            ventasFiltradas = historialVentasCache; // Mostrar todos
        }

        mostrarHistorialFiltrado(ventasFiltradas);
    });
}

async function loadHistorialVentas(user) {
    historialVentasDiv.innerHTML = '<p>Cargando historial de ventas...</p>';
    totalVentasContainer.innerHTML = '';
    filtroProductoSelect.innerHTML = '<option value="">Todos</option>'; // Reiniciar opciones de producto
    historialVentasCache = []; // Reiniciar la caché

    if (user) {
        try {
            const q = query(ventasCollection, where('uid_usuario', '==', user.uid), orderBy('fecha', 'desc'));
            const querySnapshot = await getDocs(q);
            const ventas = [];
            const productosUnicos = new Set();

            querySnapshot.forEach((doc) => {
                const venta = doc.data();
                ventas.push({...venta, id: doc.id});
                if (venta.items && Array.isArray(venta.items)) {
                    venta.items.forEach(item => productosUnicos.add(item.nombre));
                }
            });

            historialVentasCache = ventas; // Almacenar en caché

            // Llenar el selector de productos
            [...productosUnicos].sort().forEach(producto => {
                const option = document.createElement('option');
                option.value = producto;
                option.textContent = producto;
                filtroProductoSelect.appendChild(option);
            });

            mostrarHistorialFiltrado(historialVentasCache); // Mostrar el historial inicial

        } catch (error) {
            console.error('Error al cargar el historial de ventas:', error);
            historialVentasDiv.innerHTML = '<p class="error-message">Error al cargar el historial de ventas.</p>';
            totalVentasContainer.innerHTML = '';
        }
    } else {
        historialVentasDiv.innerHTML = '<p class="error-message">Usuario no autenticado.</p>';
        totalVentasContainer.innerHTML = '';
    }
}

function mostrarHistorialFiltrado(ventas) {
    let historialHTML = '<table class="sales-history-table"><thead><tr><th>Fecha</th><th>Productos Vendidos</th><th>Total</th></tr></thead><tbody>';
    let totalVentasFiltradas = 0;

    if (ventas.length > 0) {
        ventas.forEach(venta => {
            const fechaVenta = venta.fecha ? new Date(venta.fecha.seconds * 1000).toLocaleDateString() : 'N/A';
            const horaVenta = venta.fecha ? new Date(venta.fecha.seconds * 1000).toLocaleTimeString() : '';
            let productosVendidos = '';
            if (venta.items && Array.isArray(venta.items)) {
                productosVendidos = venta.items.map(item => `${item.nombre} (${item.cantidad})`).join('<br>');
            } else {
                productosVendidos = 'No hay productos registrados';
            }

            historialHTML += `
                <tr>
                    <td class="fecha-venta">${fechaVenta} <span class="hora-venta"> ${horaVenta}</span></td>
                    <td>${productosVendidos}</td>
                    <td>$${venta.total ? venta.total.toFixed(2) : 'N/A'}</td>
                </tr>
            `;
            totalVentasFiltradas += venta.total || 0;
        });
    } else {
        historialHTML += '<tr><td colspan="3">No hay ventas que coincidan con el filtro.</td></tr>';
    }

    historialHTML += '</tbody></table>';
    historialVentasDiv.innerHTML = historialHTML;
    totalVentasContainer.innerHTML = `<div class="total-ventas">Total de Ventas: $${totalVentasFiltradas.toFixed(2)}</div>`;
}