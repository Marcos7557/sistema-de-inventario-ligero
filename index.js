// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Tu configuración de Firebase (asegúrate de que coincida con tu proyecto)
const firebaseConfig = {
  apiKey: "AIzaSyCLFUnGRi12GHdAcb1W4OFLsQrJQ9ocYKs",
  authDomain: "inventario-light-d3aa5.firebaseapp.com",
  projectId: "inventario-light-d3aa5",
  storageBucket: "inventario-light-d3aa5.firebasestorage.app",
  messagingSenderId: "326691043582",
  appId: "1:326691043582:web:7baa583af785d2e2cb8daf",
  measurementId: "G-8VZ3H3DV39"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener una referencia a la base de datos
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', function() {
  const sugerenciaTextarea = document.querySelector('#sugerencias textarea'); // Asegúrate de que el textarea tenga este ID
  const enviarSugerenciaBtn = document.querySelector('#enviarSugerenciaBtn'); // Selecciona el botón por su id

  enviarSugerenciaBtn.addEventListener('click', function(event) { // Agrega 'event' como parámetro
    event.preventDefault(); // Evita la recarga de la página por el submit del formulario
    const sugerencia = sugerenciaTextarea.value;

    if (sugerencia.trim() !== "") {
      push(ref(database, 'sugerencias'), {
        texto: sugerencia,
        timestamp: new Date().toISOString()
      });

      alert('¡Gracias por tu sugerencia!');
      sugerenciaTextarea.value = ''; // Limpiar el textarea
    } else {
      alert('Por favor, escribe tu sugerencia antes de enviar.');
    }
  });
});
