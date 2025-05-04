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

    // Validar que los campos no estén vacíos
    if (!nombre || !whatsapp) {
        alert("Por favor, completa todos los campos antes de enviar.");
        return;
    }

    try {
        console.log("Guardando datos en Firestore...");
        await addDoc(collection(db, "participantes"), {
            nombre,
            whatsapp,
            fechaEnvio: new Date().toISOString(),
        });

        alert(`Quiniela enviada por ${nombre}.`);

        // Actualizar la bolsa acumulada después de registrar al participante
        actualizarBolsaAcumulada();
    } catch (error) {
        console.error("Error al enviar la quiniela: ", error);
        alert("Hubo un error al enviar la quiniela. Por favor, inténtalo de nuevo.");
    }
}

// Función para calcular y actualizar la bolsa acumulada
async function actualizarBolsaAcumulada() {
    console.log("Actualizando bolsa acumulada...");

    const montoPorParticipante = 50; // Monto fijo por participante
    const porcentajeBolsa = 0.8; // Porcentaje destinado a la bolsa

    try {
        // Obtener el número total de participantes
        const querySnapshot = await getDocs(collection(db, "participantes"));
        const totalParticipantes = querySnapshot.size;

        // Calcular la bolsa acumulada
        const bolsaTotal = totalParticipantes * montoPorParticipante * porcentajeBolsa;

        // Actualizar el elemento en el DOM
        const bolsaElemento = document.getElementById("monto-bolsa");
        bolsaElemento.textContent = bolsaTotal.toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN",
        });

        console.log(`Bolsa acumulada actualizada: ${bolsaTotal}`);
    } catch (error) {
        console.error("Error al actualizar la bolsa acumulada: ", error);
    }
}

// Función para mostrar los resultados detallados
async function mostrarResultadosDetallados() {
    console.log("Botón VER RESULTADOS DETALLADOS presionado");

    // Cambiar la vista
    document.getElementById("quiniela-container").style.display = "none";
    document.getElementById("resultados-detallados").style.display = "block";

    const detalles = document.getElementById("detalles");
    detalles.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "participantes"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const participanteHTML = `
                <div class="participante">
                    <h3>${data.nombre}</h3>
                    <p>WhatsApp: ${data.whatsapp}</p>
                </div>
            `;
            detalles.innerHTML += participanteHTML;
        });
    } catch (error) {
        console.error("Error al obtener los resultados: ", error);
        alert("Hubo un error al cargar los resultados.");
    }
}

// Función para mostrar la quiniela al momento
async function mostrarQuinielaAlMomento() {
    console.log("Botón QUINIELA AL MOMENTO presionado");

    // Cambiar la vista
    document.getElementById("quiniela-container").style.display = "none";
    document.getElementById("quiniela-al-momento").style.display = "block";

    const listaPuntos = document.getElementById("lista-puntos");
    listaPuntos.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "participantes"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const puntosHTML = `
                <li>${data.nombre}: <progress value="50" max="100"></progress> 50 puntos</li>
            `;
            listaPuntos.innerHTML += puntosHTML;
        });
    } catch (error) {
        console.error("Error al obtener la quiniela al momento: ", error);
        alert("Hubo un error al cargar la quiniela al momento.");
    }
}

// Función para volver a la Quiniela principal
function mostrarQuiniela() {
    console.log("Botón VOLVER A LA QUINIELA presionado");

    // Cambiar la vista
    document.getElementById("quiniela-container").style.display = "block";
    document.getElementById("resultados-detallados").style.display = "none";
    document.getElementById("quiniela-al-momento").style.display = "none";
}

// Espera a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    // Vincula los eventos a los botones
    const botonEnviar = document.getElementById("boton-enviar");
    const botonResultados = document.getElementById("boton-resultados");
    const botonQuinielaMomento = document.getElementById("boton-quiniela-momento");
    const botonVolver = document.getElementById("boton-volver");

    if (botonEnviar) botonEnviar.addEventListener("click", enviarQuiniela);
    if (botonResultados) botonResultados.addEventListener("click", mostrarResultadosDetallados);
    if (botonQuinielaMomento) botonQuinielaMomento.addEventListener("click", mostrarQuinielaAlMomento);
    if (botonVolver) botonVolver.addEventListener("click", mostrarQuiniela);
});

// Función para mostrar la quiniela del participante
async function verMiQuiniela() {
    console.log("Botón VER MI QUINIELA presionado");

    // Obtener el nombre ingresado por el usuario
    const nombre = document.getElementById("nombre").value;

    // Validar que el nombre no esté vacío
    if (!nombre) {
        alert("Por favor, ingresa tu nombre para buscar tu quiniela.");
        return;
    }

    try {
        console.log(`Buscando quiniela para el participante: ${nombre}...`);

        // Buscar en Firestore los datos del participante
        const querySnapshot = await getDocs(collection(db, "participantes"));
        let encontrado = false;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.nombre.toLowerCase() === nombre.toLowerCase()) {
                encontrado = true;

                // Cambiar la vista para mostrar la quiniela del participante
                document.getElementById("quiniela-container").style.display = "none";
                document.getElementById("resultados-detallados").style.display = "block";

                // Mostrar los datos de la quiniela
                const detalles = document.getElementById("detalles");
                detalles.innerHTML = `
                    <div class="participante">
                        <h3>Quiniela de: ${data.nombre}</h3>
                        <p>WhatsApp: ${data.whatsapp}</p>
                        <p>Fecha de envío: ${new Date(data.fechaEnvio).toLocaleString()}</p>
                    </div>
                `;
            }
        });

        if (!encontrado) {
            alert("No se encontró ninguna quiniela para el nombre ingresado.");
        }
    } catch (error) {
        console.error("Error al buscar la quiniela: ", error);
        alert("Hubo un error al buscar tu quiniela. Por favor, inténtalo de nuevo.");
    }
}

// Vincula el evento al botón "Ver mi Quiniela"
document.addEventListener("DOMContentLoaded", () => {
    const botonVerMiQuiniela = document.getElementById("boton-ver-mi-quiniela");
    if (botonVerMiQuiniela) {
        botonVerMiQuiniela.addEventListener("click", verMiQuiniela);
    }
});

// Función para mostrar la quiniela del participante
async function verMiQuiniela() {
    console.log("Botón VER MI QUINIELA presionado");

    // Obtener el nombre ingresado por el usuario
    const nombre = document.getElementById("nombre").value;

    // Validar que el nombre no esté vacío
    if (!nombre) {
        alert("Por favor, ingresa tu nombre para buscar tu quiniela.");
        return;
    }

    try {
        console.log(`Buscando quiniela para el participante: ${nombre}...`);

        // Buscar en Firestore los datos del participante
        const querySnapshot = await getDocs(collection(db, "participantes"));
        let encontrado = false;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.nombre.toLowerCase() === nombre.toLowerCase()) {
                encontrado = true;

                // Cambiar la vista para mostrar la quiniela del participante
                document.getElementById("quiniela-container").style.display = "none";
                document.getElementById("resultados-detallados").style.display = "block";

                // Mostrar los datos de la quiniela
                const detalles = document.getElementById("detalles");
                detalles.innerHTML = `
                    <div class="participante">
                        <h3>Quiniela de: ${data.nombre}</h3>
                        <p>WhatsApp: ${data.whatsapp}</p>
                        <p>Fecha de envío: ${new Date(data.fechaEnvio).toLocaleString()}</p>
                    </div>
                `;
            }
        });

        if (!encontrado) {
            alert("No se encontró ninguna quiniela para el nombre ingresado.");
        }
    } catch (error) {
        console.error("Error al buscar la quiniela: ", error);
        alert("Hubo un error al buscar tu quiniela. Por favor, inténtalo de nuevo.");
    }
}

// Vincula el evento al botón "Ver mi Quiniela"
document.addEventListener("DOMContentLoaded", () => {
    const botonVerMiQuiniela = document.getElementById("boton-ver-mi-quiniela");
    if (botonVerMiQuiniela) {
        botonVerMiQuiniela.addEventListener("click", verMiQuiniela);
    }
});