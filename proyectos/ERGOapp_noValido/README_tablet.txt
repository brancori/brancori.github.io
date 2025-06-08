GUÍA DE USO LOCAL - PROYECTO ERGOapp EN TABLET (TERMUX)

Desarrollado por Brandon Cortes

Este archivo explica cómo ejecutar la app ergonómica

https://f-droid.org/packages/com.termux/


────────────────────────────────────────────────────

PASO 1: Conecta tu pendrive y copia el archivo ZIP

El archivo ERGOapp.zip debe estar en una ubicación como:
/storage/XXXX-XXXX/ERGOapp.zip
o
/sdcard/Download/ERGOapp.zip

────────────────────────────────────────────────────

PASO 2: Copia y descomprime en la carpeta de trabajo

Abre Termux y ejecuta:

termux-setup-storage
cp -r /storage/XXXX-XXXX/ERGOapp.zip ~/ERGOapp.zip
cd ~
unzip ERGOapp.zip -d ERGOapp
cd ERGOapp

────────────────────────────────────────────────────

📦 PASO 3: Instala dependencias necesarias (solo la primera vez)

pkg update && pkg upgrade
pkg install nodejs
pkg install pm2
pkg install jq

────────────────────────────────────────────────────

🔧 PASO 4: Da permisos de ejecución

chmod +x iniciar-app.sh check-update.sh

────────────────────────────────────────────────────

🚀 PASO 5: Ejecuta la aplicación

bash iniciar-app.sh

Este script:
✓ Verifica si hay nuevas versiones en GitHub
✓ Descarga archivos actualizados
✓ Inicia el servidor con PM2
✓ Abre el navegador en localhost:3000

────────────────────────────────────────────────────

🛡️ PASO 6 (OPCIONAL): Arranque automático al prender la tablet

https://f-droid.org/packages/com.termux.boot/
mkdir -p ~/.termux/boot

1. Instala termux-boot desde F-Droid:
   https://f-droid.org/packages/com.termux.boot/

2. Luego ejecuta:

mkdir -p ~/.termux/boot
cp iniciar-app.sh ~/.termux/boot/start-server.sh
chmod +x ~/.termux/boot/start-server.sh

────────────────────────────────────────────────────

¡Y listo! Tu app de ergonomía ahora se ejecuta sola, se actualiza sola, y tú tienes el control total.

