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
    const nombre = document.getElementById("nombre").value;
    const whatsapp = document.getElementById("whatsapp").value;
    const comprobante = document.getElementById("comprobante").files[0];

    if (!comprobante) {
        alert("Por favor, adjunta el comprobante de transferencia.");
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

// Función para escuchar resultados oficiales
function escucharResultadosOficiales() {
    const docRef = doc(db, "configuracion", "resultadosOficiales");

    onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            resultadosOficiales = doc.data().partidos || [];
            console.log("Resultados oficiales actualizados:", resultadosOficiales);

            // Recalcular puntos automáticamente
            recalcularPuntosParticipantes();
        } else {
            console.log("No se encontró el documento de resultados oficiales.");
        }
    });
}

// Función para recalcular puntos de los participantes
async function recalcularPuntosParticipantes() {
    const lista = document.getElementById("lista-puntos");
    if (lista) lista.innerHTML = ""; // Limpia la lista si existe

    const querySnapshot = await getDocs(collection(db, "participantes"));
    querySnapshot.forEach(doc => {
        const data = doc.data();
        const resultados = data.resultados || [];
        const puntos = calcularPuntos(resultados);

        console.log(`Participante: ${data.nombre}, Puntos actualizados: ${puntos}`);

        // Actualizar la interfaz
        if (lista) {
            const item = document.createElement("li");
            item.innerHTML = `
                <h3>${data.nombre || "Sin nombre"} - ${puntos} puntos</h3>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${(puntos / resultadosOficiales.length) * 100}%;"></div>
                </div>
            `;
            lista.appendChild(item);
        }
    });
}

// Función para obtener resultados de una API externa
async function obtenerResultadosChampions() {
    const response = await fetch("https://v3.football.api-sports.io/fixtures?league=2&season=2024&stage=Semi-finals", {
        method: "GET",
        headers: {
            "x-apisports-key": "77b3eb352f381ef42355af5056408e6e"
        }
    });

    const data = await response.json();

    // Filtramos los partidos que ya han sido jugados
    const jugados = data.response.filter(p => p.fixture.status.short === "FT");

    // Actualizamos todos los resultados oficiales
    resultadosOficiales = jugados.map(partido => ({
        local: partido.goals.home,
        visitante: partido.goals.away
    }));

    // Guardamos en Firebase
    const docRef = doc(db, "configuracion", "resultadosOficiales");
    await setDoc(docRef, { partidos: resultadosOficiales });

    console.log("✅ Resultados actualizados automáticamente:", resultadosOficiales);
}

// Escuchar resultados oficiales al cargar la página
window.addEventListener("load", () => {
    escucharResultadosOficiales();
    obtenerResultadosChampions().catch(console.error);
});