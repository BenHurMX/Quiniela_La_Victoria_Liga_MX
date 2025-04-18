// Función para enviar la quiniela
function enviarQuiniela() {
    // Obtén los valores de los campos del formulario
    const nombre = document.getElementById("nombre").value;
    const whatsapp = document.getElementById("whatsapp").value;
    const comprobante = document.getElementById("comprobante").files[0];

    // Verifica que todos los campos estén llenos
    if (!nombre || !whatsapp || !comprobante) {
        alert("Por favor, completa todos los campos antes de enviar.");
        return;
    }

    // Simula el envío de la quiniela
    alert(`Quiniela enviada por ${nombre} con el número ${whatsapp}.`);

    // Oculta todos los contenedores
    document.getElementById("quiniela-container").style.display = "none";
    document.getElementById("marcador-real").style.display = "none";
    document.getElementById("resultados-detallados").style.display = "none";

    // Muestra el contenedor de "mi-quiniela"
    document.getElementById("mi-quiniela").style.display = "block";
}

// Función para volver a la Quiniela principal
function mostrarQuiniela() {
    // Oculta todos los contenedores
    document.getElementById("mi-quiniela").style.display = "none";
    document.getElementById("marcador-real").style.display = "none";
    document.getElementById("resultados-detallados").style.display = "none";

    // Muestra el contenedor principal
    document.getElementById("quiniela-container").style.display = "block";
}

// Configuración de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyABA-13aNDW3tD78fNTufyoF8qm9J2KqxY",
    authDomain: "quiniela-la-victoria.firebaseapp.com",
    projectId: "quiniela-la-victoria",
    storageBucket: "quiniela-la-victoria.appspot.com",
    messagingSenderId: "394091408215",
    appId: "1:394091408215:web:xxxxxxxxxxxxxxxx"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para calcular y actualizar la bolsa acumulada
function actualizarBolsaAcumulada(participantes) {
    const montoPorParticipante = 50; // Cada participante aporta $50
    const porcentajeBolsa = 0.8; // Solo se muestra el 80%

    // Calcula el monto total de la bolsa acumulada
    const bolsaTotal = participantes * montoPorParticipante * porcentajeBolsa;

    // Actualiza el valor en el HTML
    const bolsaElemento = document.getElementById("monto-bolsa");
    bolsaElemento.textContent = bolsaTotal.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
    });
}

// Ejemplo: Actualizar la bolsa acumulada con un número inicial de participantes
document.addEventListener("DOMContentLoaded", () => {
    const numeroDeParticipantes = 1; // Cambia este valor según sea necesario
    actualizarBolsaAcumulada(numeroDeParticipantes);
});