#!/data/data/com.termux/files/usr/bin/bash

echo "Verificando actualizaciones..."

# Versión local
LOCAL_VERSION=$(cat version.txt)

# Descargar archivo de control remoto
curl -s -o update.json "https://raw.githubusercontent.com/brancori/brancori.github.io/main/proyectos/ERGOapp/update.json"

# Obtener versión remota
REMOTE_VERSION=$(jq -r .latest update.json)

# Comparar
if [ "$LOCAL_VERSION" != "$REMOTE_VERSION" ]; then
  echo "Nueva versión disponible: $REMOTE_VERSION"
  echo "Actualizando archivos..."

  # Descargar cada archivo
  jq -r '.files | to_entries[] | "\(.key) \(.value)"' update.json | while read -r FILE URL; do
    echo "Descargando $FILE..."
    curl -L -o "$FILE" "$URL"
  done


  echo "$REMOTE_VERSION" > version.txt
  echo "Actualización completada."

  # Reiniciar si usas PM2
  pm2 restart ergonomia
else
  echo "No hay actualizaciones. Estás en la versión $LOCAL_VERSION"
fi
