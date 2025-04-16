import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC9CKF9N6eBcxTrPTP2LE7RF-ep657dohs",
    authDomain: "quiniela-la-victoria-46bc3.firebaseapp.com",
    projectId: "quiniela-la-victoria-46bc3",
    storageBucket: "quiniela-la-victoria-46bc3.appspot.com",
    messagingSenderId: "13863862689",
    appId: "1:13863862689:web:d026cefdefbbcd7c46cbe0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Solo partidos 1 y 4
const resultadosOficiales = [
    { local: 5, visitante: 5 }, // Partido 1
    { local: 1, visitante: 0 }  // Partido 4
];

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
                <div class="progress-bar" style="width: ${(puntos / 4) * 100}%;"></div>
            </div>
        `;
        lista.appendChild(item);
    });
};

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
                        <img src="logos/equipo${i + 1}-local.png" alt="Local" class="logo-pequeno" />
                        ${res.local} - ${res.visitante}
                        <img src="logos/equipo${i + 1}-visitante.png" alt="Visitante" class="logo-pequeno" />
                    </li>
                `).join("")}
            </ul>
        `;
        lista.appendChild(item);
    });
};

window.mostrarQuiniela = function () {
    document.getElementById("quiniela-container").style.display = "block";
    document.getElementById("marcador-real").style.display = "none";
    document.getElementById("resultados-detallados").style.display = "none";
    document.getElementById("configurar-resultados").style.display = "none";
};

import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function escucharResultadosOficiales() {
    const docRef = doc(db, "configuracion", "resultadosOficiales");

    onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            resultadosOficiales[0] = data.partido1; // Actualiza el partido 1
            resultadosOficiales[1] = data.partido4; // Actualiza el partido 4

            console.log("Resultados oficiales actualizados:", resultadosOficiales);

            // Recalcular puntos automáticamente
            recalcularPuntosParticipantes();
        } else {
            console.log("No se encontró el documento de resultados oficiales.");
        }
    });
}

// Llama a esta función al cargar la página
escucharResultadosOficiales();

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
                    <div class="progress-bar" style="width: ${(puntos / 4) * 100}%;"></div>
                </div>
            `;
            lista.appendChild(item);
        }
    });
}

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

    // Suponiendo que solo te interesan los partidos 1 y 4
    const partido1 = jugados[0];
    const partido4 = jugados[1];

    const resultadosActualizados = {
        partido1: {
            local: partido1.goals.home,
            visitante: partido1.goals.away
        },
        partido4: {
            local: partido4.goals.home,
            visitante: partido4.goals.away
        }
    };

    // Guardamos en Firebase
    const docRef = doc(db, "configuracion", "resultadosOficiales");
    await setDoc(docRef, resultadosActualizados);

    console.log("✅ Resultados actualizados automáticamente:", resultadosActualizados);
}


window.addEventListener("load", () => {
    obtenerResultadosChampions().catch(console.error);
});
