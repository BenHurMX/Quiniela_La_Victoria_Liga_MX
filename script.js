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
