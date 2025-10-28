// Agregar función printView
function printView() {
    const container = document.getElementById('credential_container');
    const watermarks = container.querySelectorAll('.watermark, .toggle');
    watermarks.forEach(mark => mark.style.display = 'none');
    window.print();
    watermarks.forEach(mark => mark.style.display = '');
}

function setVigencia() {
    // Obtener fecha actual
    const fechaInicio = new Date();
    
    // Agregar 6 meses
    const fechaFin = new Date(fechaInicio);
    fechaFin.setMonth(fechaFin.getMonth() + 6);
    
    // Formatear fechas (dd/mm/yyyy)
    const formatoFecha = (fecha) => {
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getFullYear();
        return `${dia}/${mes}/${año}`;
    };
    
    // Crear texto de vigencia
    document.querySelector('#vigencia').textContent = 
        `VIGENCIA ${formatoFecha(fechaInicio)} - ${formatoFecha(fechaFin)}`;
}

// Función para comprimir imagen desde archivo
async function compressImageFromFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Calcular nuevas dimensiones
                const maxDimension = 300;
                if (width > height) {
                    if (width > maxDimension) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    }
                } else {
                    if (height > maxDimension) {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                let quality = 0.7;
                let compressed = canvas.toDataURL('image/jpeg', quality);
                let size = Math.round((compressed.length * 3) / 4);

                while (size > 49000 && quality > 0.1) {
                    quality -= 0.1;
                    compressed = canvas.toDataURL('image/jpeg', quality);
                    size = Math.round((compressed.length * 3) / 4);
                }

                console.log('Tamaño final:', Math.round(size / 1024), 'KB');
                resolve(compressed);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Función para comprimir imagen desde canvas
async function compressImageFromCanvas(canvas) {
    let quality = 0.9;
    let imageData = canvas.toDataURL('image/jpeg', quality);
    let currentSize = Math.round(imageData.length / 1024);
    
    if (currentSize < 30) {
        quality = 1.0;
        imageData = canvas.toDataURL('image/jpeg', quality);
        currentSize = Math.round(imageData.length / 1024);
    }
    
    while (currentSize > 49 && quality > 0.3) {
        quality -= 0.1;
        imageData = canvas.toDataURL('image/jpeg', quality);
        currentSize = Math.round(imageData.length / 1024);
    }

    return imageData;
}

// Actualizar los event listeners para usar la función correcta
$("#pp, #LE").on("change", async function() {
    const imagen = $(this)[0].files[0];
    if (imagen) {
        try {
            const compressedImage = await compressImageFromFile(imagen);
            const targetId = this.id === "pp" ? "#list" : "#list2";
            $(targetId).html("<img src='" + compressedImage + "'>");
        } catch (error) {
            console.error('Error al comprimir la imagen:', error);
            alert('Error al procesar la imagen. Por favor, intenta con otra.');
        }
    }
});

async function sendCredential() {
    let button;
    try {
        button = document.querySelector('.send-button');
        if (button) {
            button.disabled = true;
            button.textContent = 'Enviando...';
        }

        const nombre = document.getElementById('Nt').value;
        const empresa = document.getElementById('NEC').value;

        // Crear contenedor temporal con tamaño landscape y estilos correctos
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
            width: 11in;
            height: 8.5in;
            position: fixed;
            left: -9999px;
            top: 0;
            background: white;
            padding: 0.5in;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        document.body.appendChild(tempContainer);

        // Clonar contenedor de credenciales
        const container = document.getElementById('credential_container');
        const containerClone = container.cloneNode(true);
        
        // Remover marcas de agua y toggle
        containerClone.querySelectorAll('.watermark, .toggle').forEach(el => el.remove());
        
        // Aplicar estilos de impresión exactos
        containerClone.style.cssText = `
            display: flex !important;
            width: 100% !important;
            height: 100% !important;
            justify-content: center !important;
            align-items: center !important;
            background: white !important;
            flex-direction: row !important;
            gap: 20px !important;
        `;

        // Asegurar que ambas credenciales estén visibles y con el estilo correcto
        containerClone.querySelectorAll('#front_credential, #backcredential').forEach(cred => {
            cred.style.cssText = `
                display: inline-block !important;
                width: 300px !important;
                margin: 0 10px !important;
                opacity: 1 !important;
                height: auto !important;
            `;
        });

        // Agregar clon al contenedor temporal
        tempContainer.appendChild(containerClone);

        // Capturar imagen
        const canvas = await html2canvas(tempContainer, {
            scale: 1,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: Math.round(11 * 96), // 11 inches en pixels
            height: Math.round(8.5 * 96) // 8.5 inches en pixels
        });

        // Limpiar elementos temporales
        tempContainer.remove();

        // Comprimir imagen manteniendo rango 30-49KB
        const imageData = await compressImageFromCanvas(canvas);
        const finalSizeKB = Math.round(imageData.length / 1024);
        console.log('Tamaño final de la imagen:', finalSizeKB + 'KB');

        // Enviar email
        const templateParams = {
            to_name: nombre,
            from_name: "TROX México",
            message: `Credencial generada para ${nombre} de ${empresa}`,
            to_email: "brandoncortesr7793@gmail.com",
            image: imageData.split(',')[1]
        };

        const response = await emailjs.send(
            'service_68w5xzx',
            'template_4ta2brf',
            templateParams
        );

        console.log('SUCCESS!', response.status, response.text);
        alert('¡Credencial enviada exitosamente!');
    } catch (error) {
        console.error('Error:', error);
        alert('Error al enviar la credencial: ' + error.message);
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = 'Enviar por Correo';
        }
    }
}
