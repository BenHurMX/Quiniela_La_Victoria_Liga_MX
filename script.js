function enviarQuiniela() {
  const nombre = document.getElementById("nombre").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const inputs = document.querySelectorAll("input[type='number']");
  let resultados = [];

  if (!nombre || !whatsapp) {
    alert("Por favor, ingresa tu nombre y número de WhatsApp.");
    return;
  }

  inputs.forEach((input, index) => {
    const valor = input.value.trim();
    if (valor === "") {
      alert("Por favor, completa todos los campos de los partidos.");
      return;
    }
    resultados.push(valor);
  });

  // Aquí simulas el envío de los datos. Puedes usar fetch() para enviarlos a un backend si tienes.
  console.log("Nombre:", nombre);
  console.log("WhatsApp:", whatsapp);
  console.log("Resultados:", resultados);

  alert("¡Tu quiniela ha sido enviada exitosamente!");
}

function revisarPuntaje() {
  alert("Esta función estará disponible próximamente 😎");
}

// 🔽 CÓDIGO AÑADIDO PARA VER LA QUINIELA Y PUNTAJES 🔽

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

function verMiQuiniela() {
  const nombre = document.getElementById("nombre").value;
  if (!nombre) return alert("Por favor escribe tu nombre");

  const lista = document.getElementById("lista-mi-quiniela");
  lista.innerHTML = "";

  const q = query(collection(db, "participantes"), where("nombre", "==", nombre));
  getDocs(q).then((querySnapshot) => {
    if (querySnapshot.empty) {
      lista.innerHTML = "<li>No se encontró tu quiniela</li>";
    } else {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const resultados = data.resultados || [];
        resultados.forEach((res, i) => {
          const item = document.createElement("li");
          item.textContent = `Partido ${i + 1}: ${res.local} - ${res.visitante}`;
          lista.appendChild(item);
        });
      });
    }
    document.getElementById("mi-quiniela").style.display = "block";
  });
}

function mostrarTablaParticipantes() {
  const lista = document.getElementById("lista-participantes");
  lista.innerHTML = "";

  getDocs(collection(db, "participantes")).then((snapshot) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      const puntos = calcularPuntos(data.resultados || []);
      const item = document.createElement("li");
      item.textContent = `${data.nombre}: ${puntos} pts`;
      lista.appendChild(item);
    });
  });
}

mostrarTablaParticipantes();
