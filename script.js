import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyABA-13aNDW3tD78fNTufyoF8qm9J2KqxY",
    authDomain: "quiniela-la-victoria.firebaseapp.com",
    projectId: "quiniela-la-victoria",
    storageBucket: "quiniela-la-victoria.appspot.com",
    messagingSenderId: "394091408215",
    appId: "1:394091408215:web:abcdef123456"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Resultados oficiales de todos los partidos
let resultadosOficiales = [];

// Función para calcular puntos
function calcularPuntos(misResultados) {
    let puntos = 0;
    misResultados.forEach((res, i) => {
        const oficial = resultadosOficiales[i];
        if (!oficial) return;

        const exacto = res.local == oficial.local && res.visitante == oficial.visitante;
        const resultadoUser = res.local > res.visitante ? "L" : res.local < res.visitante ? "V" : "E";
        const resultadoReal = oficial.local > oficial.visitante ? "L" : oficial.local < oficial.visitante ? "V" : "E";

        if (exacto) puntos += 2;
        else if (resultadoUser === resultadoReal) puntos += 1;
    });
    return puntos;
}

// Función para enviar la quiniela
window.enviarQuiniela = async function () {
    const nombre = document.getElementById("nombre").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();
    const comprobante = document.getElementById("comprobante").files[0];

    if (!nombre || !whatsapp || !comprobante) {
        alert("Por favor, completa todos los campos y adjunta el comprobante.");
        return;
    }

    const partidos = document.querySelectorAll('.partido');
    const resultados = [];

    partidos.forEach(partido => {
        const marcadores = partido.querySelectorAll('.marcador');
        resultados.push({
            local: parseInt(marcadores[0].value) || 0,
            visitante: parseInt(marcadores[1].value) || 0
        });
    });

    try {
        await addDoc(collection(db, "participantes"), {
            nombre: nombre,
            whatsapp: whatsapp,
            resultados: resultados,
            timestamp: new Date()
        });

        alert("¡Quiniela enviada con éxito!");
        document.getElementById("nombre").value = "";
        document.getElementById("whatsapp").value = "";
        document.getElementById("comprobante").value = "";
        document.querySelectorAll('.marcador').forEach(marcador => marcador.value = "");
    } catch (error) {
        console.error("Error al enviar la quiniela:", error);
        alert("Error al enviar la quiniela. Por favor, inténtalo de nuevo.");
    }
};

// Función para mostrar el marcador real
window.mostrarMarcadorReal = async function () {
    document.getElementById("quiniela-container").style.display = "none";
    document.getElementById("marcador-real").style.display = "block";

    const lista = document.getElementById("lista-puntos");
    lista.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "participantes"));
    querySnapshot.forEach(doc => {
        const data = doc.data();
        const resultados = data.resultados || [];
        const puntos = calcularPuntos(resultados);

        const item = document.createElement("li");
        item.innerHTML = `
            <h3>${data.nombre || "Sin nombre"} - ${puntos} puntos</h3>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${(puntos / 18) * 100}%;"></div>
            </div>
        `;
        lista.appendChild(item);
    });
};

// Función para mostrar resultados detallados
window.mostrarResultadosDetallados = async function () {
    document.getElementById("quiniela-container").style.display = "none";
    document.getElementById("marcador-real").style.display = "none";
    document.getElementById("resultados-detallados").style.display = "block";

    const lista = document.getElementById("detalles");
    lista.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "participantes"));
    querySnapshot.forEach(doc => {
        const data = doc.data();
        const resultados = data.resultados || [];

        const item = document.createElement("div");
        item.classList.add("participante");
        item.innerHTML = `
            <h3>${data.nombre || "Sin nombre"}</h3>
            <ul>
                ${resultados.map((res, i) => `
                    <li>
                        Partido ${i + 1}: ${res.local} - ${res.visitante}
                    </li>
                `).join("")}
            </ul>
        `;
        lista.appendChild(item);
    });
};

// Función para escuchar resultados oficiales
function escucharResultadosOficiales() {
    const docRef = doc(db, "configuracion", "resultadosOficiales");

    onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            resultadosOficiales = doc.data().partidos || [];
            console.log("Resultados oficiales actualizados:", resultadosOficiales);
        } else {
            console.log("No se encontró el documento de resultados oficiales.");
        }
    });
}

// Escuchar resultados oficiales al cargar la página
window.addEventListener("load", () => {
    escucharResultadosOficiales();
});

// Función para mostrar la quiniela y ocultar otros contenedores
window.mostrarQuiniela = function () {
    document.getElementById("quiniela-container").style.display = "block"; // Muestra la quiniela
    document.getElementById("marcador-real").style.display = "none"; // Oculta el marcador real
    document.getElementById("resultados-detallados").style.display = "none"; // Oculta los resultados detallados
    document.getElementById("mi-quiniela").style.display = "none"; // Oculta "Ver mi Quiniela"
};

// Función para mostrar los resultados del participante actual
window.verMiQuiniela = async function () {
    document.getElementById("quiniela-container").style.display = "none"; // Oculta la quiniela
    document.getElementById("marcador-real").style.display = "none"; // Oculta el marcador real
    document.getElementById("resultados-detallados").style.display = "none"; // Oculta los resultados detallados
    document.getElementById("mi-quiniela").style.display = "block"; // Muestra "Ver mi Quiniela"

    const nombre = document.getElementById("nombre").value.trim();
    const lista = document.getElementById("lista-mi-quiniela");
    lista.innerHTML = "";

    if (!nombre) {
        alert("Por favor, ingresa tu nombre para ver tu quiniela.");
        return;
    }

    const querySnapshot = await getDocs(collection(db, "participantes"));
    let encontrado = false;

    querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.nombre === nombre) {
            encontrado = true;
            const resultados = data.resultados || [];
            resultados.forEach((res, i) => {
                const item = document.createElement("li");
                item.textContent = `Partido ${i + 1}: ${res.local} - ${res.visitante}`;
                lista.appendChild(item);
            });
        }
    });

    if (!encontrado) {
        alert("No se encontró una quiniela con ese nombre.");
    }
};

// Función para mostrar el marcador real
window.mostrarMarcadorReal = async function () {
    document.getElementById("quiniela-container").style.display = "none"; // Oculta la quiniela
    document.getElementById("marcador-real").style.display = "block"; // Muestra el marcador real
    document.getElementById("resultados-detallados").style.display = "none"; // Oculta los resultados detallados
    document.getElementById("mi-quiniela").style.display = "none"; // Oculta "Ver mi Quiniela"

    const lista = document.getElementById("lista-puntos");
    lista.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "participantes"));
    querySnapshot.forEach(doc => {
        const data = doc.data();
        const resultados = data.resultados || [];
        const puntos = calcularPuntos(resultados);

        const item = document.createElement("li");
        item.innerHTML = `
            <h3>${data.nombre || "Sin nombre"} - ${puntos} puntos</h3>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${(puntos / 18) * 100}%;"></div>
            </div>
        `;
        lista.appendChild(item);
    });
};

// Función para mostrar resultados detallados
window.mostrarResultadosDetallados = async function () {
    document.getElementById("quiniela-container").style.display = "none"; // Oculta la quiniela
    document.getElementById("marcador-real").style.display = "none"; // Oculta el marcador real
    document.getElementById("resultados-detallados").style.display = "block"; // Muestra los resultados detallados
    document.getElementById("mi-quiniela").style.display = "none"; // Oculta "Ver mi Quiniela"

    const lista = document.getElementById("detalles");
    lista.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "participantes"));
    querySnapshot.forEach(doc => {
        const data = doc.data();
        const resultados = data.resultados || [];

        const item = document.createElement("div");
        item.classList.add("participante");
        item.innerHTML = `
            <h3>${data.nombre || "Sin nombre"}</h3>
            <ul>
                ${resultados.map((res, i) => `
                    <li>
                        Partido ${i + 1}: ${res.local} - ${res.visitante}
                    </li>
                `).join("")}
            </ul>
        `;
        lista.appendChild(item);
    });
};

// Función para calcular la bolsa acumulada
async function calcularBolsaAcumulada() {
    const querySnapshot = await getDocs(collection(db, "participantes")); // Obtén los participantes desde Firebase
    const totalParticipantes = querySnapshot.size; // Número total de participantes
    const montoTotal = totalParticipantes * 50; // Cada participante aporta $50
    const montoFinal = montoTotal * 0.8; // Calcula el 80% del monto total

    // Actualiza el monto en la página
    document.getElementById("monto-bolsa").textContent = montoFinal.toFixed(2); // Muestra el monto con 2 decimales
}

// Llama a la función al cargar la página
document.addEventListener("DOMContentLoaded", calcularBolsaAcumulada);
