// Importar Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC9CKF9N6eBcxTrPTP2LE7RF-ep657dohs",
    authDomain: "quiniela-la-victoria-46bc3.firebaseapp.com",
    projectId: "quiniela-la-victoria-46bc3",
    storageBucket: "quiniela-la-victoria-46bc3.appspot.com",
    messagingSenderId: "13863862689",
    appId: "1:13863862689:web:d026cefdefbbcd7c46cbe0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Enviar quiniela
async function enviarQuiniela() {
    console.log("Botón ENVIAR QUINIELA presionado");

    const nombre = document.getElementById("nombre").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();

    if (!nombre || !whatsapp) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    try {
        await addDoc(collection(db, "participantes"), {
            nombre,
            whatsapp,
            fechaEnvio: new Date().toISOString(),
        });

        alert(`Quiniela enviada por ${nombre}.`);
        actualizarBolsaAcumulada();
    } catch (error) {
        console.error("Error al enviar la quiniela:", error);
        alert("Error al enviar la quiniela. Intenta de nuevo.");
    }
}

// Calcular y mostrar bolsa acumulada
async function actualizarBolsaAcumulada() {
    console.log("Actualizando bolsa acumulada...");

    const montoPorParticipante = 50;
    const porcentajeBolsa = 0.8;

    try {
        const querySnapshot = await getDocs(collection(db, "participantes"));
        const totalParticipantes = querySnapshot.size;
        const bolsaTotal = totalParticipantes * montoPorParticipante * porcentajeBolsa;

        document.getElementById("monto-bolsa").textContent = bolsaTotal.toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN"
        });
    } catch (error) {
        console.error("Error al actualizar bolsa:", error);
    }
}

// Mostrar detalles de todos los participantes
async function mostrarResultadosDetallados() {
    document.getElementById("quiniela-container").style.display = "none";
    document.getElementById("resultados-detallados").style.display = "block";

    const detalles = document.getElementById("detalles");
    detalles.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "participantes"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            detalles.innerHTML += `
                <div class="participante">
                    <h3>${data.nombre}</h3>
                    <p>WhatsApp: ${data.whatsapp}</p>
                    <p>Fecha: ${new Date(data.fechaEnvio).toLocaleString()}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error al cargar resultados:", error);
        alert("Error al mostrar resultados.");
    }
}

// Mostrar puntaje por participante (mock de 8 puntos)
async function mostrarQuinielaAlMomento() {
    document.getElementById("quiniela-container").style.display = "none";
    document.getElementById("quiniela-al-momento").style.display = "block";

    const lista = document.getElementById("lista-puntos");
    lista.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "participantes"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // 🔧 Este valor debe calcularse comparando resultados reales
            const puntaje = Math.floor(Math.random() * 9); // Simula hasta 8 puntos

            lista.innerHTML += `
                <li>${data.nombre}: <progress value="${puntaje}" max="8"></progress> ${puntaje} puntos</li>
            `;
        });
    } catch (error) {
        console.error("Error al cargar quiniela al momento:", error);
        alert("Error al mostrar quiniela.");
    }
}

// Ver mi quiniela por nombre
async function verMiQuiniela() {
    const nombre = document.getElementById("nombre").value.trim();

    if (!nombre) {
        alert("Ingresa tu nombre para buscar tu quiniela.");
        return;
    }

    try {
        const querySnapshot = await getDocs(collection(db, "participantes"));
        let encontrado = false;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.nombre.toLowerCase() === nombre.toLowerCase()) {
                encontrado = true;
                document.getElementById("quiniela-container").style.display = "none";
                document.getElementById("resultados-detallados").style.display = "block";

                document.getElementById("detalles").innerHTML = `
                    <div class="participante">
                        <h3>Quiniela de: ${data.nombre}</h3>
                        <p>WhatsApp: ${data.whatsapp}</p>
                        <p>Fecha de envío: ${new Date(data.fechaEnvio).toLocaleString()}</p>
                    </div>
                `;
            }
        });

        if (!encontrado) {
            alert("No se encontró ninguna quiniela con ese nombre.");
        }
    } catch (error) {
        console.error("Error al buscar quiniela:", error);
        alert("Error al buscar tu quiniela.");
    }
}

// Volver a pantalla principal
function mostrarQuiniela() {
    document.getElementById("quiniela-container").style.display = "block";
    document.getElementById("resultados-detallados").style.display = "none";
    document.getElementById("quiniela-al-momento").style.display = "none";
}

// Eventos de botones
document.addEventListener("DOMContentLoaded", () => {
    const botones = {
        enviar: document.getElementById("boton-enviar"),
        resultados: document.getElementById("boton-resultados"),
        momento: document.getElementById("boton-quiniela-momento"),
        volver: document.getElementById("boton-volver"),
        verMiQuiniela: document.getElementById("boton-ver-mi-quiniela")
    };

    if (botones.enviar) botones.enviar.addEventListener("click", enviarQuiniela);
    if (botones.resultados) botones.resultados.addEventListener("click", mostrarResultadosDetallados);
    if (botones.momento) botones.momento.addEventListener("click", mostrarQuinielaAlMomento);
    if (botones.volver) botones.volver.addEventListener("click", mostrarQuiniela);
    if (botones.verMiQuiniela) botones.verMiQuiniela.addEventListener("click", verMiQuiniela);
});

import { onSnapshot, doc, getDocs, collection, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Función para determinar el resultado de un partido
function obtenerResultado(golesLocal, golesVisitante) {
  if (golesLocal > golesVisitante) return 'L';
  if (golesLocal < golesVisitante) return 'V';
  return 'E'; // Empate
}

// Escuchar los resultados oficiales y calcular puntajes
function escucharResultadosOficialesYActualizarPuntajes() {
  const resultadosDocRef = doc(db, 'configuracion', 'resultadosOficiales');

  onSnapshot(resultadosDocRef, async (docSnap) => {
    if (!docSnap.exists()) return;

    const resultadosOficiales = docSnap.data().partidos;

    // Obtener todos los participantes
    const participantesSnapshot = await getDocs(collection(db, 'participantes'));

    participantesSnapshot.forEach(async (docParticipante) => {
      const participante = docParticipante.data();
      const pronosticos = participante.resultados || [];
      let puntaje = 0;

      for (let i = 0; i < resultadosOficiales.length; i++) {
        const oficial = resultadosOficiales[i];
        const prediccion = pronosticos[i];

        if (!oficial || !prediccion) continue;

        const golesLocalOficial = parseInt(oficial.local);
        const golesVisitanteOficial = parseInt(oficial.vistante);

        const golesLocalPred = parseInt(prediccion.local);
        const golesVisitantePred = parseInt(prediccion.vistante);

        if (golesLocalPred === golesLocalOficial && golesVisitantePred === golesVisitanteOficial) {
          puntaje += 2;
        } else if (
          obtenerResultado(golesLocalPred, golesVisitantePred) ===
          obtenerResultado(golesLocalOficial, golesVisitanteOficial)
        ) {
          puntaje += 1;
        }
      }

      await updateDoc(docParticipante.ref, { puntaje: puntaje });
    });
  });
}

escucharResultadosOficialesYActualizarPuntajes();
