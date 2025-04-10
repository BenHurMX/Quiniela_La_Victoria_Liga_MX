
const partidos = [
  { local: "Real Madrid", visitante: "Arsenal", logoLocal: "madrid.png", logoVisitante: "arsenal.png" },
  { local: "Barcelona", visitante: "Borussia Dortmund", logoLocal: "barecelona.png", logoVisitante: "borusia.png" },
  { local: "Paris STG", visitante: "Aston Villa", logoLocal: "paris.png", logoVisitante: "aston.png" },
  { local: "Inter Mila", visitante: "Bayern Munich", logoLocal: "inter.png", logoVisitante: "bayer.png" },
];

function renderPartidos() {
  const container = document.getElementById("partidos");
  partidos.forEach((p, index) => {
    container.innerHTML += `
      <div class="partido">
        <span>${p.local}</span>
        <img src="logos/${p.logoLocal}" alt="${p.local}" />
        <input type="number" id="local-${index}" min="0" />
        <span>VS</span>
        <input type="number" id="visitante-${index}" min="0" />
        <img src="logos/${p.logoVisitante}" alt="${p.visitante}" />
        <span>${p.visitante}</span>
      </div>
    `;
  });
}

function enviarQuiniela() {
  alert("Tu quiniela fue enviada. Envíanos el comprobante de pago por WhatsApp para activarla.");
}

function revisarPuntaje() {
  alert("Aquí se mostrarán los puntajes en tiempo real (próximamente).");
}

renderPartidos();
