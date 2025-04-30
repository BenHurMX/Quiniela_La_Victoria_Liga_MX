// Importa las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
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
    console.log("Botón ENVIAR QUINIELA presionado");

    const nombre = document.getElementById("nombre").value;
    const whatsapp = document.getElementById("whatsapp").value;
    const comprobante = document.getElementById("comprobante").files[0];

    if (!nombre || !whatsapp || !comprobante) {
        alert("Por favor, completa todos los campos antes de enviar.");
        return;
    }

    try {
        const storageRef = ref(storage, `comprobantes/${comprobante.name}`);
        await uploadBytes(storageRef, comprobante);
        const comprobanteURL = await getDownloadURL(storageRef);

        await addDoc(collection(db, "participantes"), {
            nombre,
            whatsapp,
            comprobanteURL,
            fechaEnvio: new Date().toISOString(),
        });

        alert(`Quiniela enviada por ${nombre}.`);
    } catch (error) {
        console.error("Error al enviar la quiniela: ", error);
        alert("Hubo un error al enviar la quiniela.");
    }
}

// Función para calcular y actualizar la bolsa acumulada
function actualizarBolsaAcumulada(participantes) {
    console.log("Actualizando bolsa acumulada...");
    const montoPorParticipante = 50;
    const porcentajeBolsa = 0.8;

    const bolsaTotal = participantes * montoPorParticipante * porcentajeBolsa;

    const bolsaElemento = document.getElementById("monto-bolsa");
    bolsaElemento.textContent = bolsaTotal.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
    });
}

// Función para mostrar los resultados detallados
async function mostrarResultadosDetallados() {
    console.log("Botón VER RESULTADOS DETALLADOS presionado");

    document.getElementById("quiniela-container").style.display = "none";
    document.getElementById("resultados-detallados").style.display = "block";

    const detalles = document.getElementById("detalles");
    detalles.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "participantes"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const participanteHTML = `
            <div class="participante">
                <h3>${data.nombre}</h3>
                <p>WhatsApp: ${data.whatsapp}</p>
                <img src="${data.comprobanteURL}" alt="Comprobante" />
            </div>
        `;
        detalles.innerHTML += participanteHTML;
    });
}

// Función para mostrar la quiniela al momento
async function mostrarQuinielaAlMomento() {
    console.log("Botón QUINIELA AL MOMENTO presionado");

    document.getElementById("quiniela-container").style.display = "none";
    document.getElementById("quiniela-al-momento").style.display = "block";

    const listaPuntos = document.getElementById("lista-puntos");
    listaPuntos.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "participantes"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const puntosHTML = `
            <li>${data.nombre}: <progress value="50" max="100"></progress> 50 puntos</li>
        `;
        listaPuntos.innerHTML += puntosHTML;
    });
}

// Función para volver a la Quiniela principal
function mostrarQuiniela() {
    document.getElementById("quiniela-container").style.display = "block";
    document.getElementById("resultados-detallados").style.display = "none";
    document.getElementById("quiniela-al-momento").style.display = "none";
}

// Exporta las funciones al contexto global
window.enviarQuiniela = enviarQuiniela;
window.mostrarResultadosDetallados = mostrarResultadosDetallados;
window.mostrarQuinielaAlMomento = mostrarQuinielaAlMomento;
window.mostrarQuiniela = mostrarQuiniela;