import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const resultadosOficiales = [
    { local: 5, visitante: 5 },
    { local: 3, visitante: 1 },
    { local: 2, visitante: 2 },
    { local: 1, visitante: 0 }
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
      // Guarda los datos en Firestore
      await addDoc(collection(db, "participantes"), {
          nombre: nombre,
          whatsapp: whatsapp,
          resultados: resultados,
          timestamp: new Date() // Agrega un timestamp para ordenar los documentos si es necesario
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

  window.verMiQuiniela = function () {
    // Oculta el contenedor principal y muestra el contenedor de "mi quiniela"
    document.getElementById("quiniela-container").style.display = "none";
    document.getElementById("mi-quiniela").style.display = "block";

    const lista = document.getElementById("lista-mi-quiniela");
    lista.innerHTML = ""; // Limpia el contenido previo

    // Obtiene los resultados ingresados por el usuario
    const partidos = document.querySelectorAll('.partido');
    partidos.forEach((partido, index) => {
        const marcadores = partido.querySelectorAll('.marcador');
        const local = parseInt(marcadores[0].value) || 0;
        const visitante = parseInt(marcadores[1].value) || 0;

        // Crea un elemento de lista para cada partido
        const item = document.createElement("li");
        item.textContent = `Partido ${index + 1}: ${local} - ${visitante}`;
        lista.appendChild(item);
    });
};

  try {
      // Aquí puedes subir el archivo a Firebase Storage o manejarlo según tu lógica
      alert("¡Quiniela enviada con éxito!");
      document.getElementById("nombre").value = "";
      document.getElementById("whatsapp").value = "";
      document.getElementById("comprobante").value = "";
      document.querySelectorAll('.marcador').forEach(marcador => marcador.value = "");
  } catch (error) {
      console.error("Error al enviar la quiniela:", error);
      alert("Error al enviar la quiniela. Por favor, inténtalo de nuevo.");
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
                <div class="progress-bar" style="width: ${(puntos / 8) * 100}%;"></div>
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
  lista.innerHTML = ""; // Limpia el contenido previo

  const querySnapshot = await getDocs(collection(db, "participantes"));
  querySnapshot.forEach(doc => {
      const data = doc.data();
      const resultados = data.resultados || [];

      const item = document.createElement("div");
      item.classList.add("participante");
      item.innerHTML = `
          <h3>${data.nombre || "Sin nombre"}</h3>
          <ul>
              ${resultados.map((res, i) => `<li>Partido ${i + 1}: ${res.local} - ${res.visitante}</li>`).join("")}
          </ul>
      `;
      lista.appendChild(item);
  });
};

window.mostrarQuiniela = function () {
    document.getElementById("quiniela-container").style.display = "block";
    document.getElementById("marcador-real").style.display = "none";
};