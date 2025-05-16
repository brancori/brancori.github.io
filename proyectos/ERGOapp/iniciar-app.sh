#!/data/data/com.termux/files/usr/bin/bash
termux-wake-lock
cd ~/J_J_ergonomia

# Crear respaldo del día
mkdir -p respaldos
FECHA=$(date +%Y-%m-%d)
RESPALDO="respaldos/respaldo_$FECHA.json"
if [ ! -f "$RESPALDO" ]; then
  cp data.json "$RESPALDO"
fi

# Actualización remota opcional (solo si tienes conexión)
# curl -s https://tu-servidor.com/actualizacion.zip -o update.zip && unzip -o update.zip -d .

# Iniciar servidor con PM2
if ! pgrep -x "PM2" > /dev/null; then
  pm2 resurrect || pm2 start server.js --name ergonomia
  pm2 save
fi

# Abrir navegador
termux-open-url http://localhost:3000
