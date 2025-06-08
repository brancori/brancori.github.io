(function () {
  const hoy = new Date().toLocaleDateString('es-MX');
  const estado = JSON.parse(localStorage.getItem('autorizacion') || '{}');

  if (estado.bloqueado && new Date(estado.bloqueado) > new Date()) {
    mostrarProteccion(`⛔ Acceso bloqueado hasta el ${new Date(estado.bloqueado).toLocaleDateString()}`);
    return;
  }

  if (estado.fecha === hoy && estado.ok) {
    return; // acceso autorizado hoy
  }

  mostrarProteccion('🔐 Ingresa el PIN del día para acceder');
})();

function mostrarProteccion(mensaje) {
  document.documentElement.innerHTML = `
    <head>
      <meta charset="UTF-8" />
      <title>Protección</title>
      <style>
        body {
          margin: 0;
          background: #111;
          color: white;
          font-family: sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .proteccion-box {
          background: #1f1f1f;
          padding: 30px;
          border-radius: 10px;
          text-align: center;
          max-width: 320px;
        }
        .proteccion-box h2 {
          margin: 0 0 10px;
        }
        .proteccion-box input {
          width: 100%;
          padding: 10px;
          font-size: 1em;
          border-radius: 6px;
          border: none;
          margin-top: 10px;
          text-align: center;
        }
        .proteccion-box button {
          margin-top: 15px;
          background-color: #2f80ed;
          color: white;
          padding: 10px 20px;
          font-size: 1em;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        .error {
          color: red;
          margin-top: 10px;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <div class="proteccion-box">
        <h2>${mensaje}</h2>
        ${mensaje.includes('bloqueado') ? '' : `
          <input type="password" id="pinInput" placeholder="Contraseña del día" />
          <button onclick="verificarPIN()">Desbloquear</button>
          <div class="error" id="pinError"></div>
        `}
      </div>
    </body>
  `;
}

function verificarPIN() {
  const pin = document.getElementById('pinInput').value;
  const hoy = new Date();
  const dia = hoy.getDate().toString().padStart(2, '0');
  const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
  const año = hoy.getFullYear().toString().slice(2);
  const claveEsperada = `7563918${dia}${mes}${año}`;

  let estado = JSON.parse(localStorage.getItem('autorizacion') || '{}');

  if (pin === claveEsperada) {
    localStorage.setItem('autorizacion', JSON.stringify({ fecha: hoy.toLocaleDateString('es-MX'), ok: true }));
    location.reload();
  } else {
    estado.fallos = (estado.fallos || 0) + 1;
    estado.fecha = hoy.toLocaleDateString('es-MX');

    if (estado.fallos >= 5) {
      const bloqueo = new Date();
      bloqueo.setDate(bloqueo.getDate() + 3);
      estado.bloqueado = bloqueo;
      localStorage.setItem('autorizacion', JSON.stringify(estado));
      location.reload();
      return;
    }

    localStorage.setItem('autorizacion', JSON.stringify(estado));
    document.getElementById('pinError').textContent = `PIN incorrecto. Intentos restantes: ${5 - estado.fallos}`;
  }
}
