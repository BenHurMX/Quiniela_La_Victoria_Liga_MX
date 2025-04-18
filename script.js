// Importa las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

// Configuración de Firebase del proyecto
const firebaseConfig = {
    apiKey: "AIzaSyC9CKF9N6eBcxTrPTP2LE7RF-ep657dohs",
    authDomain: "quiniela-la-victoria-46bc3.firebaseapp.com",
    projectId: "quiniela-la-victoria-46bc3",
    storageBucket: "quiniela-la-victoria-46bc3.appspot.com",
    messagingSenderId: "13863862689",
    appId: "1:13863862689:web:d026cefdefbbcd7c46cbe0"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Función para enviar la quiniela
async function enviarQuiniela() {
    // Obtén los valores de los campos del formulario
    const nombre = document.getElementById("nombre").value;
    const whatsapp = document.getElementById("whatsapp").value;
    const comprobante = document.getElementById("comprobante").files[0];

    console.log("Datos del formulario:", { nombre, whatsapp, comprobante });

    // Verifica que todos los campos estén llenos
    if (!nombre || !whatsapp || !comprobante) {
        alert("Por favor, completa todos los campos antes de enviar.");
        return;
    }

    try {
        console.log("Subiendo archivo a Firebase Storage...");
        // Sube el archivo a Firebase Storage
        const storageRef = ref(storage, `comprobantes/${comprobante.name}`);
        await uploadBytes(storageRef, comprobante);
        const comprobanteURL = await getDownloadURL(storageRef);

        console.log("Guardando datos en Firestore...");
        // Guarda los datos en Firestore
        await addDoc(collection(db, "participantes"), {
            nombre: nombre,
            whatsapp: whatsapp,
            comprobanteURL: comprobanteURL,
            fechaEnvio: new Date().toISOString(),
        });

        alert(`Quiniela enviada por ${nombre} con el número ${whatsapp}.`);
    } catch (error) {
        console.error("Error al enviar la quiniela: ", error);
        alert("Hubo un error al enviar la quiniela. Por favor, inténtalo de nuevo.");
    }
}

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

// Función para volver a la Quiniela principal
function mostrarQuiniela() {
    // Oculta todos los contenedores
    document.getElementById("mi-quiniela").style.display = "none";
    document.getElementById("marcador-real").style.display = "none";
    document.getElementById("resultados-detallados").style.display = "none";

    // Muestra el contenedor principal
    document.getElementById("quiniela-container").style.display = "block";
}