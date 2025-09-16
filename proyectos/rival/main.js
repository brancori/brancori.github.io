// main.js

let jugadores = [];
let preguntas = [];
let preguntasDisponibles = [];
let preguntasIncorrectas = [];
let preguntaActual = null;

let jugadorIndex = 0;
let tiempoRestante = 180;
let timerInterval;
let chainValue = 0;
let bankValue = 0;
let currentStep = 0;
let historialRondas = [];
let rondaActual = 1;
let rondasMax = 5;

const moneyLadder = [500, 1000, 2000, 5000, 10000, 15000, 20000, 25000];

document.addEventListener("DOMContentLoaded", async () => {
  preguntas = await fetch("preguntas.json").then(r => r.json());

  document.getElementById("btn-generate").addEventListener("click", generarInputs);
  document.getElementById("btn-start").addEventListener("click", iniciarJuegoSetup);

  document.getElementById("btn-correct").addEventListener("click", () => manejarRespuesta(true));
  document.getElementById("btn-wrong").addEventListener("click", () => manejarRespuesta(false));
  document.getElementById("btn-bank").addEventListener("click", hacerBanco);

  generarEscalera();
});

function generarInputs() {
  const div = document.getElementById("player-names");
  div.innerHTML = "";
  const n = parseInt(document.getElementById("numPlayers").value);
  
  for (let i = 0; i < n; i++) {
    const container = document.createElement("div");
    container.style.marginBottom = "15px";
    
    const label = document.createElement("label");
    label.textContent = `Jugador ${i + 1}:`;
    
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Ingresa el nombre del jugador ${i + 1}`;
    input.id = `jugador-${i}`;
    
    container.appendChild(label);
    container.appendChild(input);
    div.appendChild(container);
  }
}

function iniciarJuegoSetup() {
  const n = parseInt(document.getElementById("numPlayers").value);
  const useBots = document.getElementById("useBots").checked;
  jugadores = [];

  for (let i = 0; i < n; i++) {
    const input = document.getElementById(`jugador-${i}`);
    let nombre = input?.value.trim() || "";
    if (!nombre && useBots) nombre = "Bot " + (i + 1);
    if (nombre) jugadores.push({ nombre, esBot: nombre.startsWith("Bot") });
  }

  jugadores.sort((a, b) => a.nombre.localeCompare(b.nombre));

  if (jugadores.length < 2) {
    alert("Se necesitan al menos 2 jugadores");
    return;
  }

  document.getElementById("setup-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");

  iniciarJuego();
}

function iniciarJuego() {
  jugadorIndex = 0;
  chainValue = 0;
  bankValue = 0;
  currentStep = 0;
  rondaActual = 1;
  historialRondas = [];
  preguntasDisponibles = [...preguntas]; // Clonar lista de preguntas
  preguntasIncorrectas = [];

  iniciarRonda();
}

function iniciarRonda() {
  // Muestra los controles del juego al iniciar la ronda
  document.getElementById("controls-row").classList.remove("hidden");

  chainValue = 0;
  currentStep = 0;
  jugadorIndex = 0;

  historialRondas.push({
    ronda: rondaActual,
    acumulado: 0,
    stats: jugadores.map(j => ({
      nombre: j.nombre,
      correctas: 0,
      incorrectas: 0,
      bancos: 0,
      dinero: 0
    }))
  });

  actualizarJugador();
  mostrarPregunta();
  actualizarUI();

  tiempoRestante = 180;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    tiempoRestante--;
    actualizarTimer();
    if (tiempoRestante <= 0) {
      clearInterval(timerInterval);
      terminarRonda();
    }
  }, 1000);
}

function obtenerSiguientePregunta() {
  if (preguntasDisponibles.length === 0) {
    preguntasDisponibles = [...preguntas]; // Reciclar preguntas si se acaban
  }
  const randomIndex = Math.floor(Math.random() * preguntasDisponibles.length);
  return preguntasDisponibles.splice(randomIndex, 1)[0];
}

function mostrarPregunta() {
  preguntaActual = obtenerSiguientePregunta();
  
  if (!preguntaActual) {
    alert("No hay más preguntas disponibles");
    return;
  }
  
  document.getElementById("categoria").textContent = preguntaActual.categoria;
  document.getElementById("pregunta").textContent = preguntaActual.pregunta;
  document.getElementById("respuesta").textContent = "Respuesta: " + preguntaActual.respuesta;
}

function manejarRespuesta(correcta) {
  const stats = historialRondas[historialRondas.length - 1].stats.find(
    s => s.nombre === jugadores[jugadorIndex].nombre
  );

  if (correcta) {
    stats.correctas++;
    currentStep = Math.min(currentStep + 1, moneyLadder.length);
    if (currentStep > 0) {
      chainValue = moneyLadder[currentStep - 1];
    }
  } else {
    stats.incorrectas++;
    chainValue = 0;
    currentStep = 0;
    if (preguntaActual) {
       preguntasIncorrectas.push(preguntaActual);
    }
  }
  
  siguienteTurno(); // Pasa al siguiente jugador y muestra nueva pregunta
}

function hacerBanco() {
  if (chainValue === 0) return;

  const stats = historialRondas[historialRondas.length - 1].stats.find(
    s => s.nombre === jugadores[jugadorIndex].nombre
  );
  const rondaData = historialRondas[historialRondas.length - 1];
  const maxPorRonda = 25000;
  
  let valorBancado = chainValue;

  if (rondaData.acumulado >= maxPorRonda) {
    alert("Ya se alcanzó el máximo de $25,000 para esta ronda.");
    chainValue = 0;
    currentStep = 0;
    actualizarUI();
    mostrarPregunta();
    return;
  }

  if (rondaData.acumulado + valorBancado > maxPorRonda) {
    valorBancado = maxPorRonda - rondaData.acumulado;
    alert(`¡Límite de la ronda alcanzado! Solo se bancan $${valorBancado.toLocaleString()}`);
  }

  bankValue += valorBancado;
  stats.bancos++;
  stats.dinero += valorBancado;
  rondaData.acumulado += valorBancado;

  chainValue = 0;
  currentStep = 0;
  
  actualizarUI();

  if (rondaData.acumulado >= maxPorRonda) {
    clearInterval(timerInterval);
    alert("🏆 ¡Se alcanzó el máximo acumulado de la ronda!");
    terminarRonda();
    return;
  }
  
  mostrarPregunta();
}

function siguienteTurno() {
  jugadorIndex = (jugadorIndex + 1) % jugadores.length;
  actualizarJugador();
  mostrarPregunta();
  actualizarUI();
}

function actualizarUI() {
  document.getElementById("chain").textContent = "Cadena actual: $" + chainValue.toLocaleString();
  document.getElementById("bank").textContent = "Banco total: $" + bankValue.toLocaleString();
  
  const rondaData = historialRondas[historialRondas.length - 1];
  if (rondaData) {
    document.getElementById("round-info").textContent = 
      `Ronda ${rondaData.ronda} — Acumulado: $${rondaData.acumulado.toLocaleString()}`;
  }
  
  actualizarEscalera();
}

function actualizarTimer() {
  const min = Math.floor(tiempoRestante / 60);
  const sec = tiempoRestante % 60;
  document.getElementById("timer").textContent =
    `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function actualizarJugador() {
  document.getElementById("current-player").textContent =
    "Turno de: " + jugadores[jugadorIndex].nombre;
}

function generarEscalera() {
  const ladderDiv = document.getElementById("ladder");
  ladderDiv.innerHTML = "";
  // El bucle ahora itera hacia adelante, del valor menor al mayor
  for (let i = 0; i < moneyLadder.length; i++) {
    const step = document.createElement("div");
    step.classList.add("ladder-step");
    step.id = "step-" + i;
    step.textContent = "$" + moneyLadder[i].toLocaleString();
    ladderDiv.appendChild(step);
  }
}

function actualizarEscalera() {
  for (let i = 0; i < moneyLadder.length; i++) {
    document.getElementById("step-" + i)?.classList.remove("active-step");
  }
  
  if (currentStep > 0) {
    document.getElementById("step-" + (currentStep - 1))?.classList.add("active-step");
  }
}

function terminarRonda() {
  // Oculta los controles del juego al finalizar la ronda
  document.getElementById("controls-row").classList.add("hidden");

  const rondaData = historialRondas[historialRondas.length - 1];
  clearInterval(timerInterval);
  alert(`Ronda ${rondaData.ronda} terminada. Acumulado: $${rondaData.acumulado.toLocaleString()}`);

  const li = document.createElement("li");
  li.textContent = `Ronda ${rondaData.ronda} — $${rondaData.acumulado.toLocaleString()}`;
  li.onclick = () => { /* ...código de detalle... */ };
  document.getElementById("round-history").appendChild(li);

  if (rondaActual < rondasMax && jugadores.length > 2) {
    rondaActual++;
    gestionarFinDeRonda();
  } else {
    const ganador = jugadores.sort((a, b) => b.dinero - a.dinero)[0];
    alert(`🎉 Juego terminado. Banco Final: $${bankValue.toLocaleString()}\nEl ganador es: ${ganador.nombre}`);
    window.location.reload();
  }
}

function gestionarFinDeRonda() {
  const div = document.getElementById("elimination");
  div.classList.remove("hidden");
  div.innerHTML = "";

  const rondaData = historialRondas[historialRondas.length - 1];
  const stats = rondaData.stats.filter(s => jugadores.some(j => j.nombre === s.nombre));

  // Determinar más fuerte y más débil
  const masFuerte = [...stats].sort((a, b) => b.dinero - a.dinero || b.correctas - a.correctas)[0].nombre;
  const masDebil = [...stats].sort((a, b) => a.dinero - b.dinero || b.incorrectas - a.incorrectas)[0].nombre;

  // Construir HTML de estadísticas
  let statsHTML = `<h3>Estadísticas de la Ronda ${rondaData.ronda}</h3>`;
  statsHTML += `<p><strong>💪 El más fuerte:</strong> ${masFuerte}</p>`;
  statsHTML += `<p><strong>📉 El más débil:</strong> ${masDebil}</p>`;
  statsHTML += "<ul>";
  stats.forEach(s => {
    statsHTML += `<li><strong>${s.nombre}:</strong> 
      $${s.dinero.toLocaleString()} (${s.bancos} bancos) | 
      ✔ ${s.correctas} | 
      ✖ ${s.incorrectas}
    </li>`;
  });
  statsHTML += "</ul><hr><h4>Elige al Rival Más Débil o continúa:</h4>";
  div.innerHTML = statsHTML;

  // Contenedor para los botones
  const actionsContainer = document.createElement("div");
  
  // Crear botones de eliminación
  jugadores.forEach((jugador, idx) => {
    const btn = document.createElement("button");
    btn.textContent = `Eliminar a ${jugador.nombre}`;
    btn.onclick = () => {
      alert(`${jugador.nombre} ha sido eliminado.`);
      jugadores.splice(idx, 1);
      div.classList.add("hidden");
      iniciarRonda();
    };
    actionsContainer.appendChild(btn);
  });

  // Botón para continuar sin eliminar
  const btnContinuar = document.createElement("button");
  btnContinuar.textContent = "Continuar sin eliminar";
  btnContinuar.style.background = "#28a745"; // Estilo verde
  btnContinuar.onclick = () => {
    div.classList.add("hidden");
    iniciarRonda();
  };
  actionsContainer.appendChild(btnContinuar);
  
  div.appendChild(actionsContainer);
}

function mostrarEliminacion() {
  const div = document.getElementById("elimination");
  div.classList.remove("hidden");
  const cont = document.getElementById("players-to-eliminate");
  cont.innerHTML = "<h3>Elige al Rival Más Débil</h3>";

  jugadores.forEach((j, idx) => {
    const btn = document.createElement("button");
    btn.textContent = j.nombre;
    btn.onclick = () => {
      jugadores.splice(idx, 1);
      div.classList.add("hidden");
      if(jugadores.length > 1){
        iniciarRonda();
      } else {
         alert("🎉 Juego terminado. Ganador: " + jugadores[0].nombre);
         document.getElementById("game-screen").classList.add("hidden");
         document.getElementById("setup-screen").classList.remove("hidden");
      }
    };
    cont.appendChild(btn);
  });
}