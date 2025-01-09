export const questions = [
    {
        "question": "Requisito para ser cliente corporativo:",
        "answers": ["Mínimo de 10 líneas en una sola región", "Máximo de 5 líneas en una región", "Al menos 20 líneas en dos regiones", "Sin límite de líneas"],
        "correct": 0
    },
    {
        "question": "¿Qué requisitos se necesitan para incluir a un cliente corporativo sin tener 10 líneas activas?",
        "answers": ["Consumo promedio de $10,000 o más en un periodo de 6 meses", "Consumo promedio de $5,000 o más en un periodo de 3 meses", "Tener al menos 5 líneas activas", "Cumplir con un mínimo de 15 líneas en total"],
        "correct": 0
    },
    {
        "question": "Un cliente corporativo puede tener:",
        "answers": ["Tarifas corporativas y adendum a 12, 18 y 24 meses", "Tarifas residenciales y adendum a 6, 12 y 18 meses", "Tarifas mixtas y adendum a 3, 6 y 9 meses", "Tarifas únicas y adendum a 12 y 24 meses"],
        "correct": 0
    },
    {
        "question": "¿Quiénes son Clientes corporativos regionales?",
        "answers": ["Clientes de 10 líneas en adelante son atendidos por asesores internos o especialistas de atención empresarial. Se identifican en el sistema de facturación como tipo de cuenta CM o MG y su ciclo de facturación puede ser 31 ó 32", "Clientes de 5 líneas en adelante son atendidos por asesores externos. Se identifican en el sistema de facturación como tipo de cuenta CR y su ciclo de facturación puede ser 30 ó 33", "Clientes con más de 20 líneas son atendidos por especialistas regionales. Se identifican en el sistema como tipo de cuenta RG y su ciclo de facturación es 31", "Clientes con menos de 10 líneas son atendidos por asesores internos y se identifican en el sistema de facturación como tipo de cuenta IR"],
        "correct": 0
    },
    {
        "question": "¿Qué clientes se consideran segmento corporativo CM?",
        "answers": ["Clientes de 10 a 49 líneas o consumos de 10 a 30 mil pesos", "Clientes de 5 a 9 líneas o consumos de 5 a 10 mil pesos", "Clientes de 50 a 99 líneas o consumos de 30 a 50 mil pesos", "Clientes de 1 a 9 líneas o consumos de menos de 10 mil pesos"],
        "correct": 0
    },
    {
        "question": "¿Qué clientes se consideran segmento corporativo MG?",
        "answers": ["Clientes de 50 líneas en adelante y/o consumos de más de $30,000", "Clientes de 20 a 49 líneas y/o consumos de $20,000 a $30,000", "Clientes de 10 a 19 líneas y/o consumos de $10,000 a $20,000", "Clientes de 1 a 9 líneas y/o consumos de menos de $10,000"],
        "correct": 0
    },
    {
        "question": "Son los clientes con consumos de $200,000 o más y que tienen responsabilidad de pago y negociación en R9, ciclo de facturación 20 y puede ser CO o MG:",
        "answers": ["Cliente corporativo R9", "Cliente regional R8", "Cliente local R7", "Cliente empresarial R6"],
        "correct": 0
    },
    {
        "question": "¿Cuáles son las características de un cliente empresarial R9?",
        "answers": ["Ciclo 60 o 61, responsabilidad de pago R9", "Ciclo 50 o 51, responsabilidad de pago R8", "Ciclo 40 o 41, responsabilidad de pago R7", "Ciclo 30 o 31, responsabilidad de pago R6"],
        "correct": 0
    }
    ,
    {
        "question": "¿Qué es Región con responsabilidad de negociación?",
        "answers": ["Región donde se realizan las negociaciones y el cierre de la venta, la cual tiene la relación con el contacto del cliente. Como regla general es la región donde se encuentren las oficinas corporativas del cliente. Es la región responsable de mantener y darle seguimiento a las líneas que se encuentren a nivel nacional.", "Región donde se gestionan las cuentas internacionales.", "Región que maneja exclusivamente los clientes premium.", "Región que se dedica a la gestión de pagos."],
        "correct": 0
    },
    {
        "question": "¿Qué son líneas regionales?",
        "answers": ["Líneas CM y MG con número de la región que les reporta la responsabilidad de pago y negociación están en la misma región.", "Líneas con tarifas reducidas para clientes locales.", "Líneas utilizadas para comunicación interregional.", "Líneas especializadas en servicios internacionales."],
        "correct": 0
    },
    {
        "question": "¿Qué son líneas interregionales?",
        "answers": ["Líneas CM y MG con número de región diferente a la que les reporta, pero responsabilidad de pago y negociación están en la región que les atiende.", "Líneas utilizadas exclusivamente para clientes internacionales.", "Líneas que no tienen asignación regional.", "Líneas utilizadas para la gestión interna de la empresa."],
        "correct": 0
    },
    {
        "question": "Son líneas MG, CM, 31 o 32 activadas con números de la región que las reporta pero que son atendidas y tienen responsabilidad de pago y negociación en una región distinta.",
        "answers": ["Líneas foráneas", "Líneas locales", "Líneas residenciales", "Líneas corporativas internas"],
        "correct": 0
    },
    {
        "question": "Verificar que el cliente no tenga líneas canceladas en abogado, afianzadoras o deducción fiscal (ciclos 97, 98 o 99) ni con saldos a más de 60 días son:",
        "answers": ["Acciones que debe tomar el asesor de servicio a clientes al recibir líneas nuevas", "Acciones que debe tomar el cliente para activar nuevas líneas", "Requisitos para la contratación de servicios adicionales", "Pasos para la reactivación de líneas suspendidas"],
        "correct": 0
    },
    {
        "question": "¿Qué clase de crédito deben tener los clientes corporativos, salvo autorización de la DEUR?",
        "answers": ["RP en cuentas padre, BU si la RP es en las hijas. En ctas. no consolidadas BU.", "Crédito estándar en todas las cuentas.", "Crédito limitado en cuentas hijas.", "Crédito especial en cuentas consolidadas."],
        "correct": 0
    },
    {
        "question": "Clave que indica el ciclo de facturación de una línea pospago",
        "answers": ["BILLING CYCLE", "PAYMENT CYCLE", "INVOICE CYCLE", "ACCOUNT CYCLE"],
        "correct": 0
    },
    {
        "question": "Número de líneas y tarifas corporativas.",
        "answers": ["AA (1-5), BB (6-20), CC (21-100) y DD (más de 100)", "A (1-10), B (11-30), C (31-50) y D (más de 50)", "X (1-15), Y (16-40), Z (41-75) y W (más de 75)", "P (1-20), Q (21-40), R (41-60) y S (más de 60)"],
        "correct": 0
    },
    {
        "question": "Los clientes precorporativos en que ciclo de facturación se encuentran:",
        "answers": ["MASIVO", "CORPORATIVO", "REGIONAL", "INDUSTRIAL"],
        "correct": 0
    },
    {
        "question": "Beneficio que consiste en poder contratar por cada línea corporativa 2 líneas en tarifas AA:",
        "answers": ["Beneficio corporativo", "Descuento especial", "Plan de fidelidad", "Promoción temporal"],
        "correct": 0
    },
    {
        "question": "Tipo de cuenta con el que identificas una línea de plan empleado corporativo Masivo:",
        "answers": ["VE", "VC", "EM", "ME"],
        "correct": 0
    },
    {
        "question": "En qué ciclo se activan las líneas empleado corporativo:",
        "answers": ["Ciclo Masivo", "Ciclo Corporativo", "Ciclo Regional", "Ciclo Empresarial"],
        "correct": 0
    },
    {
        "question": "¿Qué sucede con las líneas empleado corporativo si la empresa relacionada con este servicio cancela las líneas con Telcel?",
        "answers": ["Los empleados parientes o familiares relacionados pierden la tarifa empresarial, por lo que sus planes se cambiarán al plan homólogo de mercado masivo con tarifas de mercado masivo", "Las líneas se mantienen activas pero con una tarifa diferente", "Los empleados pueden optar por mantener la tarifa empresarial", "Las líneas se cancelan automáticamente"],
        "correct": 0
    },
    {
        "question": "Si una persona física acude a CAC a solicitar cesión de derechos para persona moral ¿Quién debe hacer el trámite?",
        "answers": ["Las cesiones de derecho de un cliente masivo a un cliente corporativo y viceversa debe hacerlas el asesor corporativo de la región que atienda la cuenta al momento del trámite, ya que requieren cambio de ciclo y cuenta para el cual está facultado.", "El asesor de servicio al cliente", "El gerente regional", "El departamento de ventas"],
        "correct": 0
    },
    {
        "question": "¿Cuantas líneas con adeudo puede tener una empresa a la que se le requiere ceder una línea?",
        "answers": ["No se tramita cesión de derechos si la persona física o moral que recibe la cuenta tiene alguna cuenta suspendida o cancelada por morosidad.", "Puede tener hasta 5 líneas con adeudo", "No puede tener más de 2 líneas con adeudo", "Puede tener cualquier cantidad de líneas con adeudo"],
        "correct": 0
    },
    {
        "question": "Sistema para agendar citas en Centro de atención:",
        "answers": ["SIMAEC WEB", "CITAS TELCEL", "AGENDA ONLINE", "CENTRO VIRTUAL"],
        "correct": 0
    },
    {
        "question": "En esta sección de la factura de servicio encuentras información de planes y paquetes contratados /consumo de voz, mensajería y servicios corporativos:",
        "answers": ["Servicios de Telecomunicaciones Telcel", "Detalle de Consumo", "Resumen de Facturación", "Información de la Cuenta"],
        "correct": 0
    },
    {
        "question": "Documentos que enuncia los siguientes puntos: libertad de elegir, derecho a la portabilidad y desbloqueo, derecho a condiciones de contratación claras, justas y equitativas, derecho a la no discriminación:",
        "answers": ["Carta de derechos de los usuarios", "Términos y Condiciones", "Contrato de Servicio", "Guía del Usuario"],
        "correct": 0
    },
    {
        "question": "La baja de servicios o productos adicionales con costo: Se programa:",
        "answers": ["1 día antes del corte a menos que el usuario lo solicite al momento", "El mismo día del corte", "2 días antes del corte", "Una semana antes del corte"],
        "correct": 0
    },
    {
        "question": "El alta de servicios adicionales con costo: Se programa:",
        "answers": ["Un día después de la fecha de corte a menos que el usuario lo solicite al momento", "El mismo día del corte", "Una semana después de la fecha de corte", "El mismo día"],
        "correct": 0
    },
    {
        "question": "Los servicios adicionales solo son bonificados por el asesor de servicio a clientes cuando:",
        "answers": ["Han sido facturados en un periodo no mayor a 3 meses y no existe comentario en M2K pantalla COMNT de algún asesor donde indique que el cliente lo solicitó", "El cliente lo solicita al momento", "Han sido facturados en un periodo mayor a 3 meses", "Hay un comentario en M2K pantalla COMNT"],
        "correct": 0
    },
    {
        "question": "Para conocer las cuentas ligadas a una cuenta nacional, ¿en qué pantalla es?",
        "answers": ["RGREL", "COMNT", "M2K", "RGACC"],
        "correct": 0
    },
    {
        "question": "Servicio no compatible con planes corporativos:",
        "answers": ["Telcel UP", "VPN", "Cost Control", "Red Privada"],
        "correct": 0
    },
    {
        "question": "Permite a una compañía integrar a todos sus usuarios móviles en una sola red, a través de una marcación corta:",
        "answers": ["VPN", "Telcel UP", "Cost Control", "Red Privada"],
        "correct": 0
    },
    {
        "question": "Cuál es la función de VPN Cost Control?",
        "answers": ["Control del límite de crédito en la línea, comunicación entre las líneas de la cuenta, control de consumos en la línea, abono de saldos, bloqueo de servicios, convivencia con SMS y servicios de datos", "Control de datos móviles", "Control de llamadas internacionales", "Bloqueo de mensajes de texto"],
        "correct": 0
    },
    {
        "question": "Marcación de Red Privada Telcel:",
        "answers": ["*876", "*123", "*456", "*789"],
        "correct": 0
    },
    {
        "question": "Qué servicios no son compatibles con VPN Cost Control?",
        "answers": ["Pools, Productos de bloqueo, Scan Telcel y Gps Telcel, contestone, tarifas fronterizas, paquete de videollamada", "Solo Pools", "Solo contestone", "Solo tarifas fronterizas"],
        "correct": 0
    },
    {
        "question": "Servicio diseñado para compañías que requieren tener comunicación con sus empleados o recursos que requieran recibir notificaciones o avisos de manera oportuna en cualquier lugar en el que se encuentren:",
        "answers": ["e-mail corto en tu Telcel", "VPN", "Telcel UP", "Red Privada"],
        "correct": 0
    },
    {
        "question": "¿Cuántos caracteres tiene un servicio de E SMS corto a tu Telcel?",
        "answers": ["150", "160", "140", "130"],
        "correct": 0
    },
    {
        "question": "Servicio por el cual las empresas tienen un conjunto de herramientas de mensajería vía SMS que ofrece a las empresas diferentes posibilidades de comunicación interna de gran efectividad:",
        "answers": ["Mensajería empresarial MET", "Mensaje corto", "SMS Empresarial", "Comunicación interna"],
        "correct": 0
    },
    {
        "question": "El servicio de mensajería empresarial incluye 4 herramientas. ¿Cuáles son?",
        "answers": ["web a móvil, mail a móvil, móvil a mail y aplicación a móvil", "web a móvil y mail a móvil", "móvil a mail y mail a móvil", "solo web a móvil"],
        "correct": 0
    },
    {
        "question": "En el servicio de mensajería MET, ¿quiénes pertenecen a la lista negra?",
        "answers": ["Números pertenecientes a la lista blanca bloqueados para enviar y recibir mensajería", "Números bloqueados por el administrador", "Números desconocidos", "Números internacionales"],
        "correct": 0
    },
    {
        "question": "Es un requisito para que una empresa pueda contratar el servicio MET:",
        "answers": ["Tener sus cuentas consolidadas en una o varias cuentas padre sin importar la responsabilidad de pago", "Tener al menos 10 líneas corporativas", "Tener una cuenta bancaria activa", "Tener un plan de datos"],
        "correct": 0
    },
    {
        "question": "Modalidad de MET que a través de una interfaz web las empresas tendrán una solución para el envío de mensajes a equipos móviles de sus empleados, fuerzas de venta, grupos internos, etc:",
        "answers": ["web a móvil", "mail a móvil", "móvil a mail", "aplicación a móvil"],
        "correct": 0
    },
    {
        "question": "Número máximo de caracteres que puede enviarse en MET:",
        "answers": ["320 caracteres", "160 caracteres", "200 caracteres", "180 caracteres"],
        "correct": 0
    },
    {
        "question": "Los usuarios de la empresa puedan enviar SMS a dicha marcación, los cuales serán entregados como un mail a la cuenta de correo asociada. ¿Cómo se llama esta aplicación?",
        "answers": ["móvil a mail", "web a móvil", "mail a móvil", "aplicación a móvil"],
        "correct": 0
    },
    {
        "question": "El cliente tiene que desarrollar una aplicación simple para comunicar sus alarmas o mensajes. ¿Cómo se llama esta aplicación?",
        "answers": ["aplicación a móvil", "móvil a mail", "mail a móvil", "web a móvil"],
        "correct": 0
    },
    {
        "question": "¿Cuál es el costo del servicio adicional de WhatsApp para planes empresariales?",
        "answers": ["$29", "$19", "$39", "$49"],
        "correct": 0
    },
    {
        "question": "¿Qué actividades permite el límite de uso de 5G para WhatsApp?",
        "answers": ["Envío/Recepción de mensajes de texto, imágenes, fotos, video, notas de voz, contactos de agenda y notificaciones", "Solo envío de mensajes de texto", "Solo envío de imágenes", "Solo recepción de mensajes de texto"],
        "correct": 0
    },
    {
        "question": "¿Se pueden combinar paquetes de roaming internacional, masivos y corporativos?",
        "answers": ["Sí, con restricciones", "No", "Sí, sin restricciones", "Solo para ciertos usuarios"],
        "correct": 0
    },
    {
        "question": "¿El paquete de Roaming Internacional de Voz para qué llamadas aplica?",
        "answers": ["Llamadas entrantes y salientes con destino al propio país visitado, hacia México, EUA o América Latina", "Solo llamadas entrantes", "Solo llamadas salientes", "Llamadas internas dentro del país visitado"],
        "correct": 0
    },
    {
        "question": "¿En qué se convierte una línea mixta estando en roaming internacional?",
        "answers": ["En línea prepago", "En línea postpago", "En línea corporativa", "En línea de emergencia"],
        "correct": 0
    },
    {
        "question": "Al activar el producto de Siroi en una línea Cost Control, ¿qué paquetes se pueden dar de alta?",
        "answers": ["Paquetes de datos y minutos roaming internacional", "Solo paquetes de datos", "Solo paquetes de minutos", "Paquetes nacionales"],
        "correct": 0
    },
    {
        "question": "¿En qué pantalla se ve el consumo de paquetes de roaming internacional de datos?",
        "answers": ["PAC/PAQUINT", "FEATS", "RGREL", "COMNT"],
        "correct": 0
    },
    {
        "question": "¿En qué pantalla se programa la vigencia del paquete de voz de roaming zona 1?",
        "answers": ["FEATS", "PAC/PAQUINT", "RGREL", "COMNT"],
        "correct": 0
    },
    {
        "question": "Cuando un cliente cancela por FALCO, ¿a qué área se debe involucrar?",
        "answers": ["Ingeniería", "Ventas", "Atención al cliente", "Soporte técnico"],
        "correct": 0
    },
    {
        "question": "¿Cómo se identifica al proveedor de una sim card?",
        "answers": ["Por el octavo dígito", "Por el primer dígito", "Por el último dígito", "Por el tercer dígito"],
        "correct": 0
    },
    {
        "question": "¿Cuándo entra una sim en garantía?",
        "answers": ["Cuando tiene menos de un año de facturada, no presenta daños físicos ni derrame de líquidos, ni está quemada (sim rechazada o puk bloqueado)", "Cuando tiene menos de dos años de facturada", "Cuando no presenta daños físicos", "Cuando no presenta derrame de líquidos"],
        "correct": 0
    },
    {
        "question": "Es el servicio que permite realizar pagos móviles, transferencias de dinero y consultas en tiempo real las 24 horas del día desde tu celular a través de mensajes de texto SMS:",
        "answers": ["Transfer", "Banca móvil", "Pagos móviles", "Mensajería financiera"],
        "correct": 0
    },
    {
        "question": "¿Qué características debe tener un celular para utilizar Transfer?",
        "answers": ["Equipos celulares que puedan enviar y recibir mensajes de texto (SMS) y notificaciones instantáneas (USSD)", "Equipos celulares con conexión a internet", "Equipos celulares con pantalla táctil", "Equipos celulares con cámara"],
        "correct": 0
    },
    {
        "question": "Es la marcación para activar el servicio TRANSFER:",
        "answers": ["*4040", "*1234", "*5678", "*9101"],
        "correct": 0
    },
    {
        "question": "¿Cuántas cuentas Transfer puede tener una línea Telcel?",
        "answers": ["Solo 1", "Hasta 2", "Hasta 3", "Ilimitadas"],
        "correct": 0
    },
    {
        "question": "¿Cuántos dispositivos Smart Watch se pueden enlazar o activar en una línea?",
        "answers": ["Hasta dos", "Solo uno", "Hasta tres", "Ilimitados"],
        "correct": 0
    },
    {
        "question": "Características de SMS TD corporativo incluyen:",
        "answers": ["Un número determinado de SMS que pueden ser enviados a cualquier operador", "Envío ilimitado de SMS", "Envío de SMS solo a operadores nacionales", "Envío de SMS solo a operadores internacionales"],
        "correct": 0
    },
    {
        "question": "De acuerdo a la campaña de renovación C1, ¿qué sucede para el caso de clientes con adendum vigente?",
        "answers": ["Se suman los meses restantes al nuevo plazo", "Se restan los meses restantes del nuevo plazo", "Se mantiene el plazo original", "Se cancela el adendum vigente"],
        "correct": 0
    },
    {
        "question": "¿Cuál es el plazo máximo que puede tener una línea que renueva con C1?",
        "answers": ["30 meses", "12 meses", "24 meses", "36 meses"],
        "correct": 0
    },
    {
        "question": "¿A partir de cuántos meses restantes se puede aplicar C1?",
        "answers": ["6 meses", "3 meses", "12 meses", "18 meses"],
        "correct": 0
    },
    {
        "question": "En la campaña de renovación de clientes corporativos C1, los beneficios que están autorizados a aplicar al cliente se consideran a partir de adendum a:",
        "answers": ["12 meses", "6 meses", "18 meses", "24 meses"],
        "correct": 0
    },
    {
        "question": "¿Para qué sirve el sistema GPS?",
        "answers": ["Permite determinar una posición en cualquier lugar a través de satélites y señal GPS", "Para enviar mensajes de texto", "Para realizar llamadas", "Para acceder a internet"],
        "correct": 0
    },
    {
        "question": "Es un servicio diseñado para localizar, rastrear y monitorear los vehículos de una empresa mediante GPS y LBS:",
        "answers": ["Gestión Vehicular Telcel GVT", "Telemetría avanzada", "Monitorización vehicular", "Control de flota"],
        "correct": 0
    },
    {
        "question": "¿Cuáles son los 2 tipos de GVT que hay?",
        "answers": ["GVT mi auto ($229) y GVT plus ($329)", "GVT básico y GVT avanzado", "GVT estándar y GVT premium", "GVT lite y GVT pro"],
        "correct": 0
    },
    {
        "question": "2 características (utilidades) del GVT:",
        "answers": ["Funcionalidades de LOCALIZACION TELEMETRIA y control", "Funcionalidades de comunicación y rastreo", "Funcionalidades de navegación y control", "Funcionalidades de seguridad y monitoreo"],
        "correct": 0
    },
    {
        "question": "Los MB que incluyen los planes GVT son para uso en:",
        "answers": ["México, EU y Canadá", "Solo en México", "Solo en EU", "Solo en Canadá"],
        "correct": 0
    },
    {
        "question": "Ejemplo de utilidades de telemetría y control de GVT:",
        "answers": ["Detección de velocidad y paro de motor", "Detección de temperatura y humedad", "Detección de movimiento y ubicación", "Detección de combustible y batería"],
        "correct": 0
    },
    {
        "question": "Es una solución integral que permite a las empresas incrementar la productividad con la utilización de telemetría avanzada como medición de combustible, temperatura, movimiento, sensores:",
        "answers": ["GVT TEKNOLOGISTIC", "GVT Avanzado", "GVT Empresarial", "GVT Plus"],
        "correct": 0
    },
    {
        "question": "Es una solución que transforma tu vehículo en un auto inteligente, permitiendo monitorearlo en tiempo real a través de una aplicación, y conocer el rendimiento, estado, ubicación; además crear una zona WiFi para compartir internet con los pasajeros a bordo:",
        "answers": ["Smartcar control 2gb", "Vehículo Inteligente", "Auto Conectado", "Car WiFi"],
        "correct": 0
    },
    {
        "question": "¿Cuántos vehículos se pueden monitorear con la aplicación SmartCar?",
        "answers": ["Hasta 24 vehículos", "Hasta 12 vehículos", "Hasta 6 vehículos", "Hasta 18 vehículos"],
        "correct": 0
    },
    {
        "question": "¿Qué es Smart Car Empresarial?",
        "answers": ["Monitorea en tiempo real el rendimiento, el estado, la actividad y la ubicación del automóvil, brindándole al usuario información útil sobre conductas de manejo, mantenimiento preventivo y problemas del auto, transformando el vehículo en un automóvil inteligente utilizando solamente una App y un equipo GPS que no requiere instalación", "Monitorea solo la ubicación del automóvil", "Monitorea solo el rendimiento del automóvil", "Monitorea solo la actividad del automóvil"],
        "correct": 0
    },
    {
        "question": "¿Cuáles son los beneficios principales de Smart Car Empresarial?",
        "answers": [
            "El vehículo no pierde garantías, instalación no invasiva; Activación sencilla por el usuario; Un equipo se puede usar en diferentes vehículos; Internet a bordo listo para compartir",
            "Permite monitorear el estado del automóvil; Internet a bordo listo para compartir; Un equipo por vehículo",
            "Activación complicada; Instalación requiere soporte técnico; Equipo fijo en un solo vehículo",
            "Internet a bordo limitado a un dispositivo; Instalación compleja; Activación realizada por Telcel"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son los plazos disponibles para Smart Car?",
        "answers": ["Plazo libre, 18 y 24 meses", "12 y 18 meses", "Solo plazo forzoso de 24 meses", "6, 12 y 18 meses"],
        "correct": 0
    },
    {
        "question": "¿Qué componentes incluye la solución Smart Car?",
        "answers": [
            "Dispositivo GPS, suscripción, app Smart Car Telcel",
            "Solo la app Smart Car Telcel",
            "Dispositivo GPS y un plan de datos sin suscripción",
            "Suscripción y dispositivo sin necesidad de app"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuántos vehículos puedes visualizar con Zeek mi auto?",
        "answers": [
            "24 vehículos",
            "18 vehículos",
            "12 vehículos",
            "6 vehículos"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuánto cuesta la renta de Zeek mi auto?",
        "answers": [
            "$199.00",
            "$299.00",
            "$399.00",
            "$699.00"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es Video a Bordo?",
        "answers": [
            "Es una solución que brinda información de video en tiempo real de las diferentes perspectivas de una unidad, como cabina, exterior o dentro de las cajas",
            "Es una herramienta para grabar video únicamente del interior de la cabina",
            "Es un servicio de transmisión de video para flotas de transporte pesado",
            "Es una app que muestra videos educativos para conductores"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué beneficios tiene Video a Bordo?",
        "answers": [
            "App móvil para monitoreo de las unidades, alertas de hasta 14 eventos en tiempo real, grabación por evento, permite descargar video y foto, reporte histórico de 400 días",
            "Permite visualizar grabaciones de hasta 7 días únicamente",
            "Incluye reportes básicos de eventos de manejo, pero sin alertas",
            "No permite descarga de videos, pero genera reportes históricos"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es la funcionalidad del sistema DMS de Video a Bordo?",
        "answers": [
            "Permite alertar por voz al conductor sobre comportamientos anormales o malos hábitos (cansancio, ojos cerrados, uso de celular)",
            "Detecta automáticamente peligros y malas prácticas de manejo con inteligencia artificial",
            "Genera reportes automáticos de eventos críticos sin alertar al conductor",
            "Monitorea únicamente la ubicación y estado del vehículo"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el costo de instalación local de Video a Bordo?",
        "answers": [
            "$1500",
            "$199",
            "$699",
            "$1299"
        ],
        "correct": 0
    },
    {
        "question": "¿A cuántos meses puedes financiar Video a Bordo?",
        "answers": [
            "24 meses",
            "18 meses",
            "12 meses",
            "36 meses"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es la marcación correcta para llamadas desde el extranjero con destino a una línea de México en modalidad CPP?",
        "answers": [
            "+52 + (10 dígitos celular)",
            "+01 + (10 dígitos celular)",
            "+55 + (10 dígitos celular)",
            "+1 + (10 dígitos celular)"
        ],
        "correct": 0
    },
    {
        "question": "En el proceso de retención de una línea, si el cliente acepta la promoción de Plan Amigo, se dice que la línea fue:",
        "answers": [
            "Cancelada",
            "Activada",
            "Suspendida temporalmente",
            "Transferida a prepago"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuántos dígitos contiene el IDCOP?",
        "answers": [
            "14",
            "10",
            "12",
            "16"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el proveedor externo encargado de validar las portabilidades y generar solicitudes?",
        "answers": [
            "ABD",
            "Telcel",
            "CFE",
            "SIAPA"
        ],
        "correct": 0
    },
    {
        "question": "El producto Telcel Sin Límite aplica para planes empresariales en modalidades:",
        "answers": [
            "VPN y VPNCC",
            "Solo VPN",
            "Canales abiertos y cerrados",
            "Modalidad roaming internacional"
        ],
        "correct": 0
    },
    {
        "question": "¿Dónde pueden utilizarse los MB incluidos en el plan Telcel Max Empresarial?",
        "answers": [
            "México, EU y Canadá",
            "México y Canadá únicamente",
            "México y EU únicamente",
            "México, Centroamérica y EU"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué servicio se puede ofrecer a un usuario que viaja a EU y realiza muchas llamadas?",
        "answers": [
            "Paquete de minutos en roaming internacional o servicio Telcel Sin Frontera",
            "Plan Amigo con cobertura extendida",
            "Telcel Max Empresarial con opción de roaming gratuito",
            "Video a Bordo con opción internacional"
        ],
        "correct": 0
    },
    {
        "question": "¿En qué pantalla se ve si una línea tiene pool de datos?",
        "answers": [
            "CONSL",
            "POOLINFO",
            "DATAPOOL",
            "LINEINFO"
        ],
        "correct": 0
    },
    {
        "question": "¿Pool de datos aplica a nivel?",
        "answers": [
            "Nacional solo en líneas de datos",
            "Internacional para líneas de voz y datos",
            "Local en líneas de datos",
            "Regional para líneas específicas"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el número máximo de líneas que pueden estar en un pool de datos?",
        "answers": [
            "No hay máximo",
            "Hasta 50 líneas",
            "Hasta 100 líneas",
            "Hasta 200 líneas"
        ],
        "correct": 0
    },
    {
        "question": "¿Las líneas pueden tener pool de datos y de voz?",
        "answers": [
            "NO",
            "Sí, pero con restricciones",
            "Solo en modalidad empresarial",
            "Depende del plan contratado"
        ],
        "correct": 0
    },
    {
        "question": "¿Se puede dar pool a líneas que no estén consolidadas?",
        "answers": [
            "NO",
            "Sí, con autorización previa",
            "Sí, pero solo a nivel regional",
            "Depende de la configuración del plan"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el carácter que se usa para dar de alta un pool de datos?",
        "answers": [
            "\"D\"",
            "\"P\"",
            "\"L\"",
            "\"T\""
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es labor proactiva?",
        "answers": [
            "Nos permite conocer si el cliente está conforme con el servicio y detectar áreas de oportunidad",
            "Es una estrategia para realizar ventas adicionales",
            "Es un proceso de activación de nuevos servicios",
            "Es una herramienta para realizar encuestas de satisfacción"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué ventaja tiene el plan PBX?",
        "answers": [
            "Reducir costos en llamadas locales a celulares",
            "Permitir acceso ilimitado a redes sociales",
            "Ofrecer minutos internacionales sin costo",
            "Gestionar datos y voz en un solo plan"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué restricciones tiene el plan PBX?",
        "answers": [
            "No aplica con equipo ilimitado, ni pool de minutos",
            "No puede usarse en líneas internacionales",
            "No es compatible con redes sociales gratuitas",
            "No permite financiamiento de equipos"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué consiste el financiamiento de equipos?",
        "answers": [
            "Permite que un cliente corporativo pague las diferencias de equipos y módems en parcialidades",
            "Es un programa para obtener smartphones de gama alta sin costo inicial",
            "Consiste en financiar solo dispositivos móviles con planes específicos",
            "Es un servicio exclusivo para clientes empresariales"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el importe mínimo para financiar un equipo?",
        "answers": [
            "$500.00",
            "$399.00",
            "$1000.00",
            "$750.00"
        ],
        "correct": 0
    },
    {
        "question": "¿Para quién está disponible el financiamiento de equipos?",
        "answers": [
            "Para clientes masivos y corporativos",
            "Solo para clientes masivos",
            "Solo para clientes corporativos",
            "Exclusivamente para clientes empresariales"
        ],
        "correct": 0
    },
    {
        "question": "¿A qué plazo pueden pagar la diferencia?",
        "answers": [
            "12, 18 o 24 meses",
            "Solo 24 meses",
            "6, 12 o 24 meses",
            "18 o 36 meses"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué porcentaje se le sube al equipo en financiamiento?",
        "answers": [
            "Del 10 al 35% del financiamiento otorgado, de acuerdo al plazo y plan, con base en boletín 222",
            "Del 5 al 20% dependiendo del tipo de cliente",
            "Un 15% adicional fijo para todos los planes",
            "Del 10 al 20% dependiendo del monto del equipo"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué porcentaje se le sube al equipo en planes menores a $399?",
        "answers": [
            "Del 15 al 35%",
            "Del 10 al 20%",
            "Un 20% fijo",
            "Del 5 al 15%"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué porcentaje se le aumenta al equipo en un plazo de 24 meses con renta de $399.00?",
        "answers": [
            "El 20%",
            "El 25%",
            "El 15%",
            "El 35%"
        ],
        "correct": 0
    },
    {
        "question": "¿En qué programa se evalúa el financiamiento de un equipo?",
        "answers": [
            "Evaluador",
            "FinanSys",
            "EquipManager",
            "DataCheck"
        ],
        "correct": 0
    },
    {
        "question": "¿A qué marcas se les puede otorgar financiamiento de equipo?",
        "answers": [
            "A todas las marcas de Smartphone o Tablet",
            "Solo a marcas de gama alta",
            "Únicamente a marcas autorizadas por Telcel",
            "A marcas seleccionadas según el plan"
        ],
        "correct": 0
    },
    {
        "question": "¿Cómo se refleja el financiamiento en el detalle del estado de cuenta?",
        "answers": [
            "Parcialidad 1 de X",
            "Pago diferido en sección adicional",
            "Cuota mensual separada del total",
            "Cargo único al inicio del contrato"
        ],
        "correct": 0
    },
    {
        "question": "¿Quién está autorizado para solicitar una cancelación?",
        "answers": [
            "El contacto por medio de correo electrónico con previa autorización del representante legal",
            "Cualquier persona con acceso a la cuenta",
            "El titular de la línea exclusivamente",
            "Un representante técnico autorizado por el cliente"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el costo de consulta de buzón de voz para líneas con paquete Sin Límite?",
        "answers": [
            "El costo del minuto del plan que se tenga",
            "Es gratuito",
            "Un cargo fijo de $2 por minuto",
            "Depende de la cantidad de mensajes consultados"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son las funciones de Norton Empresas?",
        "answers": [
            "Seguridad Wi-Fi, antiphishing, App Advisor para publicidad no deseada",
            "Protección contra spyware, administración de dispositivos y copias de seguridad automáticas",
            "Firewall avanzado, análisis de rendimiento y respaldo en la nube",
            "Protección de identidad, análisis de malware y bloqueador de llamadas"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es Norton Empresas?",
        "answers": [
            "Es un software que brinda protección contra virus, archivos maliciosos y estafas online, además de proteger su identidad y las transacciones que se realizan en línea. Otorga las herramientas necesarias para proteger Smartphones, tablets, PC’s y Mac",
            "Es una herramienta para gestionar contraseñas y datos en dispositivos corporativos",
            "Es un sistema de respaldo automático en la nube para dispositivos empresariales",
            "Es una aplicación exclusiva para proteger dispositivos Android de empresas"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son las funciones de Norton Empresas para iPhone/iPad?",
        "answers": [
            "Alertas del sistema operativo, protección web, seguridad Wi-Fi, alertas de perfiles sospechosos",
            "Protección contra software malicioso, App Advisor, antiphishing",
            "Bloqueo de contenido no deseado, firewall avanzado, análisis en tiempo real",
            "Respaldo en la nube, análisis de rendimiento, protección de identidad"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son las funcionalidades de Norton Empresas para dispositivos Android?",
        "answers": [
            "System Advisor, seguridad Wi-Fi, bloqueo de software malicioso, App Advisor para publicidad no deseada e intrusiva, protección web antiphishing",
            "Firewall, análisis en tiempo real, respaldo en la nube, App Advisor",
            "Seguridad Wi-Fi, protección de identidad, análisis de rendimiento, alertas de amenazas",
            "Bloqueo de llamadas, protección contra spyware, sistema de alerta de malware"
        ],
        "correct": 0
    },
    {
        "question": "¿En qué consiste la funcionalidad de System Advisor de Norton Empresas?",
        "answers": [
            "Alerta acerca de amenazas para el sistema operativo y certificados de seguridad que permiten a los atacantes acceder al dispositivo",
            "Monitorea el rendimiento del dispositivo para detectar problemas de software",
            "Realiza análisis en tiempo real de aplicaciones en uso",
            "Proporciona respaldo automático de los datos almacenados"
        ],
        "correct": 0
    },
    {
        "question": "En el servicio de Norton, una de las funciones de la consola de administración es:",
        "answers": [
            "Asignar licencias de manera individual o masiva",
            "Realizar copias de seguridad automáticas",
            "Monitorear en tiempo real la actividad de los dispositivos",
            "Configurar contraseñas únicas para cada usuario"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el precio de Norton Empresarial?",
        "answers": [
            "En Smartphone $17 de 1 a 3000 licencias, $14 más de 3000 licencias, y en Multidispositivo $20 y $17",
            "$15 por licencia en cualquier dispositivo",
            "$20 fijo por licencia en modalidad Multidispositivo",
            "$10 por licencia en modalidad básica"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el plazo de contrato para activar el servicio Norton Security Empresarial?",
        "answers": [
            "0 meses",
            "12 meses",
            "18 meses",
            "24 meses"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es Avast Premium Security?",
        "answers": [
            "Es un software antivirus y suite de seguridad para la protección en línea completa de equipos de cómputo, teléfonos y tabletas",
            "Es una herramienta de respaldo automático para dispositivos empresariales",
            "Es un sistema de monitoreo para redes empresariales",
            "Es una aplicación exclusiva para dispositivos móviles"
        ],
        "correct": 0
    },
    {
        "question": "¿Para qué tipo de usuarios aplica Avast Premium Security?",
        "answers": [
            "Prepago, Pospago y Plan mixto",
            "Solo usuarios Pospago",
            "Solo usuarios Prepago",
            "Exclusivamente para empresas"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es Airwatch?",
        "answers": [
            "Es una plataforma de administración de movilidad empresarial que se integra con los sistemas de la empresa y permite administrar todos los dispositivos móviles de la empresa desde una consola central",
            "Es un software de protección de datos corporativos en la nube",
            "Es una herramienta para realizar copias de seguridad automáticas",
            "Es un sistema exclusivo para monitoreo de redes empresariales"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son 3 características de Airwatch?",
        "answers": [
            "Implementaciones flexibles, solución con base de código única, datos en tiempo real de los dispositivos",
            "Protección avanzada contra malware, gestión de usuarios, herramientas de análisis de datos",
            "Respaldo automático, compatibilidad con múltiples dispositivos, alertas de seguridad",
            "Sistema de administración local, configuración de perfiles, sincronización en la nube"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuántas soluciones tiene Airwatch?",
        "answers": [
            "2: Workspace One Estándar y Workspace One Advanced",
            "1: Workspace One",
            "3: Workspace One Básico, Avanzado y Premium",
            "4: Soluciones integrales para dispositivos móviles"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es Workspace One?",
        "answers": [
            "Es una plataforma de espacio de trabajo digital que permite suministrar y administrar de manera simple y segura cualquier aplicación en cualquier dispositivo",
            "Es una herramienta para realizar copias de seguridad en la nube",
            "Es un software exclusivo para administración de redes empresariales",
            "Es una aplicación para gestionar dispositivos móviles de forma remota"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el costo de Airwatch?",
        "answers": [
            "$80 Workspace Estándar y $120 Workspace Advanced",
            "$50 por licencia en cualquier modalidad",
            "$100 en modalidad avanzada únicamente",
            "$60 básico y $150 avanzado"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son los requisitos para usar 4G?",
        "answers": [
            "SIM 4G, terminal LTE y cobertura LTE",
            "SIM estándar, equipo compatible y paquete de datos",
            "Cobertura 4G, contrato en plan empresarial y equipo de gama alta",
            "SIM LTE, cobertura 5G y equipo actualizado"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son los beneficios del cambio de SIM a 4G?",
        "answers": [
            "Permite navegar a la máxima velocidad de red 4G, mejora la satisfacción de nuestros clientes, mejora la experiencia en redes sociales, descarga rápida de aplicaciones, reproducción de medios a una mejor velocidad",
            "Ofrece acceso a planes exclusivos, brinda soporte técnico mejorado y permite conectividad en zonas rurales",
            "Aumenta la vida útil del equipo, mejora la calidad de las llamadas y reduce los costos de datos",
            "Permite navegar en 5G, aumenta el almacenamiento interno y mejora la resolución de pantalla"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son las principales ventajas de la tecnología 4G LTE?",
        "answers": [
            "Mayor velocidad, seguridad en la transmisión de información y sin una inversión adicional",
            "Conexión internacional, mayor alcance de señal y planes económicos",
            "Compatibilidad con todos los dispositivos, mayor almacenamiento en la nube y reducción de costos",
            "Mayor seguridad en aplicaciones bancarias, soporte técnico dedicado y compatibilidad con 5G"
        ],
        "correct": 0
    },
    {
        "question": "¿Cómo validar que una línea está navegando en 4G?",
        "answers": [
            "Que aparezca la leyenda 4G o LTE en el indicador de cobertura del equipo",
            "Verificando el plan contratado",
            "A través de la configuración del equipo",
            "Con la consulta en la aplicación de servicio al cliente"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el costo del servicio 4G LTE?",
        "answers": [
            "$0",
            "$50 mensuales",
            "$10 por GB consumido",
            "$100 de activación única"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es VoLTE?",
        "answers": [
            "Es la siguiente generación de llamadas de voz en alta definición y video mejorado. Voice Over LTE es una red de alta velocidad que permite garantizar una mayor calidad de servicio",
            "Es un sistema de conectividad exclusivo para videoconferencias en alta calidad",
            "Es una plataforma que mejora el rendimiento de aplicaciones en red LTE",
            "Es un software que habilita la conexión entre dispositivos a través de Bluetooth"
        ],
        "correct": 0
    },
    {
        "question": "¿Con qué servicios es compatible VoLTE?",
        "answers": [
            "Buzón de voz MIO y VIVOM, mensajes de dos vías (SMS), mensajes multimedia (MMS), productos de redes sociales, servicios Fonyou, llamada por cobrar, buzón de voz por cobrar, transferencia de llamada (solo iPhone), identificador de llamadas, llamadas tripartitas en Postpago (de voz tradicional), llamadas en espera, productos de datos, bloqueos/desbloqueo de larga distancia, conferencia Telcel, Contestone",
            "Solo con servicios de voz y mensajería básica",
            "Exclusivamente con videollamadas en alta calidad",
            "Con servicios de datos ilimitados únicamente"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es 5G?",
        "answers": [
            "Es la quinta generación de tecnología móvil que permite un mejor acceso a servicios y aplicaciones de realidad aumentada, realidad virtual y de entretenimiento, ofreciendo una experiencia mucho más ágil y avanzada, hasta 20 veces más rápida que 4G",
            "Es una tecnología que optimiza las conexiones LTE existentes para mayor alcance",
            "Es un software que mejora el rendimiento de los equipos móviles",
            "Es un sistema exclusivo para dispositivos de gama alta"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son los requisitos para navegar en 5G?",
        "answers": [
            "SIM versión 6.3 en adelante, cobertura 5G, plan o paquete 5G y equipo compatible",
            "SIM estándar, equipo actualizado y plan empresarial",
            "Cobertura 4G LTE, dispositivo de última generación y paquete de datos ilimitados",
            "SIM 5G, conexión Wi-Fi y equipo compatible con LTE"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son 3 ventajas de la tecnología 5G?",
        "answers": [
            "Mayor velocidad, menor latencia, experiencia y velocidad mejoradas",
            "Conexión global, mayor seguridad en redes sociales y bajo costo",
            "Compatibilidad con todos los dispositivos, planes accesibles y mayor alcance de señal",
            "Aumento de memoria en dispositivos, reducción de costos y compatibilidad con 4G"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son tres principales aplicaciones de 5G?",
        "answers": [
            "Automatización de operaciones y procesos, trabajo remoto, conectividad más estable y confiable",
            "Masificación del Internet de las Cosas, manejo de grandes volúmenes de datos, conectividad más segura y rápida",
            "Realidad aumentada, optimización de redes empresariales, acceso exclusivo a servicios en la nube",
            "Conexión global, soporte técnico avanzado, mayor almacenamiento en dispositivos"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es el Internet de las Cosas?",
        "answers": [
            "Se refiere a la interconexión digital de todo tipo de objetos cotidianos a través de la Red",
            "Es la conectividad entre dispositivos electrónicos de una empresa",
            "Es un sistema que optimiza el uso de aplicaciones móviles",
            "Es una tecnología que conecta dispositivos solo en redes 5G"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es la hiperconectividad?",
        "answers": [
            "Conectar un mayor número y tipo de dispositivos en tiempo real",
            "Optimizar redes existentes para alcanzar mayor alcance",
            "Establecer conexión entre dispositivos de alto rendimiento",
            "Administrar múltiples conexiones en una sola plataforma"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el costo mensual del servicio de Smart Things IoT?",
        "answers": [
            "$129",
            "$99",
            "$149",
            "$199"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son los requisitos para utilizar el servicio SmartThings IoT?",
        "answers": [
            "Contar con un plan abierto pospago, masivo y corporativo, y descargar la app SmartThings",
            "Tener un dispositivo compatible y acceso a internet móvil",
            "Contar con una línea prepago y descargar la app desde la tienda",
            "Tener un equipo actualizado y suscripción anual al servicio"
        ],
        "correct": 0
    },
    {
        "question": "¿En qué consiste el Servicio Samsung Knox?",
        "answers": [
            "Es un conjunto de soluciones de movilidad empresarial que mejoran la productividad y mantienen la información segura en los dispositivos móviles",
            "Es un software exclusivo para la gestión remota de equipos móviles",
            "Es una aplicación para realizar copias de seguridad en dispositivos Samsung",
            "Es una herramienta que optimiza el rendimiento de las redes empresariales"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es Telcel Cloud?",
        "answers": [
            "Conjunto de servicios SaaS alojados en la nube que permite contratar y gestionar soluciones sin invertir en infraestructura como Office 365, Aspel, Google Workspace, venta de dominios y Claro Drive Negocios",
            "Es una plataforma exclusiva para almacenamiento en la nube para empresas",
            "Es un servicio para administrar redes empresariales de manera remota",
            "Es un software que mejora el rendimiento de las conexiones LTE"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué solución permite controlar dispositivos Android para obtener reportes de uso y consumo de aplicaciones?",
        "answers": [
            "Control Móvil Telcel",
            "Samsung Knox",
            "Airwatch",
            "Workspace One"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es Control Móvil Telcel?",
        "answers": [
            "Es una solución que permite tener el control sobre dispositivos Android para obtener reportes de uso y consumo de aplicaciones",
            "Es un software para optimizar redes empresariales",
            "Es una aplicación para la gestión remota de dispositivos Samsung",
            "Es un sistema exclusivo para empresas que necesitan seguridad avanzada"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son los beneficios de Control Móvil Telcel?",
        "answers": [
            "Optimiza tiempo y costos de trabajo, protege información con borrado remoto y bloqueo seguro, incluye geolocalización en tiempo real",
            "Brinda acceso a redes empresariales seguras y mejora la conectividad",
            "Aumenta la productividad mediante reportes automáticos y mayor alcance de red",
            "Reduce costos en servicios móviles y optimiza la transmisión de datos"
        ],
        "correct": 0
    },
    {
        "question": "¿Para qué planes aplica Control Móvil Telcel?",
        "answers": [
            "Abiertos, controlados, CPP, MPP (controlados con cargo a factura). El consumo de datos se debita de los MB incluidos del plan",
            "Solo para planes empresariales y de alta gama",
            "Para líneas prepago con acceso a redes 4G",
            "Para líneas con tecnología LTE únicamente"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el costo y clave de activación de Control Móvil Telcel avanzado?",
        "answers": [
            "$29 y la clave de activación es CMT01",
            "$25 y la clave de activación es CMT02",
            "$30 y la clave de activación es CMT03",
            "$35 y la clave de activación es CMT04"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es la principal ventaja de Sekur Messenger?",
        "answers": [
            "Máxima seguridad bajo las leyes de privacidad de la jurisdicción suiza",
            "Compatibilidad con múltiples dispositivos móviles",
            "Acceso exclusivo a redes empresariales",
            "Integración con sistemas de almacenamiento en la nube"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son los beneficios de Sekur Messenger?",
        "answers": [
            "Manejo seguro de transmisión de información con cifrado avanzado",
            "Acceso a redes privadas y optimización de recursos empresariales",
            "Protección contra amenazas cibernéticas y mayor almacenamiento",
            "Conexión estable y reducción de costos en servicios de mensajería"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué funcionalidades ofrece la gestión de fuerza en campo powered by Lertek?",
        "answers": [
        "Gestionar el personal en campo mediante GPS, asignar tareas al personal en campo, realizar check in y check out, visualizar recorridos, enviar evidencia en tiempo real, creación de puntos de interés y geocercas personalizadas",
        "Solo gestionar el personal en campo mediante GPS",
        "Solo asignar tareas al personal en campo",
        "Solo realizar check in y check out"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué solución ofrece la funcionalidad de gestión de compras y ventas para comercios minoristas?",
        "answers": [
        "Punto de venta móvil",
        "Gestión de compras",
        "Gestión de ventas",
        "Gestión de inventarios"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son algunas funcionalidades de la solución punto de venta móvil?",
        "answers": [
        "Venta a granel, puede utilizarse de forma fija o móvil, acepta múltiples dispositivos periféricos, reportes en tiempo real",
        "Solo venta a granel",
        "Solo aceptación de múltiples dispositivos periféricos",
        "Solo reportes en tiempo real"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué especificaciones requiere la app punto de venta móvil?",
        "answers": [
        "Tablet Android 4.4 o superior 8 o 10”, 1GB RAM, 32GB almacenamiento, Bluetooth",
        "Tablet Android 3.0 o superior 7 o 8”, 512MB RAM, 16GB almacenamiento, Bluetooth",
        "Tablet iOS 10 o superior, 2GB RAM, 64GB almacenamiento, WiFi",
        "Laptop Windows 10, 4GB RAM, 128GB almacenamiento"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el costo de licencia de punto de venta móvil?",
        "answers": [
        "$349 mensual, $3619 anual",
        "$299 mensual, $3419 anual",
        "$399 mensual, $3819 anual",
        "$449 mensual, $4019 anual"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el prefijo de SMS por cobrar?",
        "answers": [
        "033",
        "034",
        "035",
        "036"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el prefijo de SMS respuesta pagada?",
        "answers": [
        "035",
        "033",
        "034",
        "036"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué funcionalidades ofrece la Eficiencia Energética?",
        "answers": [
        "Administración de edificios e inmuebles, Detección de comportamientos, Reportes a la medida",
        "Solo administración de edificios e inmuebles",
        "Solo detección de comportamientos",
        "Solo reportes a la medida"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué incluye la renta anual de Eficiencia Energética?",
        "answers": [
        "Plataforma, Conectividad y la mesa de ayuda y soporte",
        "Solo Plataforma",
        "Solo Conectividad",
        "Solo la mesa de ayuda y soporte"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es el concepto de GVT CTTMX?",
        "answers": [
        "Un servicio de geolocalización que brinda soluciones especializadas en operación, logística, rastreo, temperatura y de combustible",
        "Una aplicación móvil",
        "Un software de facturación",
        "Un servicio de atención al cliente"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son algunas funcionalidades de GVT CTTMX?",
        "answers": [
        "Básicas, avanzadas, telemetría, temperatura y combustible",
        "Solo básicas",
        "Solo avanzadas",
        "Solo telemetría"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son algunas funcionalidades de la Red Privada Telcel?",
        "answers": [
        "Recolección comunicación, Cobertura garantizada y acceso a la red, Conmutación y transmisión de información, Productividad Comunicación y Seguridad, Toma de decisión oportuna",
        "Solo recolección comunicación",
        "Solo cobertura garantizada y acceso a la red",
        "Solo conmutación y transmisión de información"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el costo por cambio de lugar en el servicio de Internet en tu casa?",
        "answers": [
        "$100.00 con IVA",
        "$50.00 con IVA",
        "$75.00 con IVA",
        "$150.00 con IVA"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es el concepto de Claro Connect?",
        "answers": [
        "Un servicio que permite a las empresas conectar objetos cotidianos a Internet y administrar dicha conexión de manera autónoma",
        "Un software de contabilidad",
        "Un servicio de atención al cliente",
        "Un sistema de gestión de inventarios"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son los escenarios de redes privadas?",
        "answers": [
        "Conectividad como servicio, Red privada E2E como servicio, Operación como servicio",
        "Solo conectividad como servicio",
        "Solo red privada E2E como servicio",
        "Solo operación como servicio"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son los plazos de GVT CTTMX?",
        "answers": [
        "Libre, 12, 18, 24 y 36 meses",
        "Solo libre",
        "Solo 12 meses",
        "Solo 18 meses"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es la vigencia de cotización para cambio de equipo con renovación?",
        "answers": [
        "15 días siempre y cuando no haya cambiado la versión de la tabla de precios; en caso de actualización, deberán de cotizar nuevamente los equipos",
        "10 días siempre y cuando no haya cambiado la versión de la tabla de precios",
        "5 días siempre y cuando no haya cambiado la versión de la tabla de precios",
        "20 días siempre y cuando no haya cambiado la versión de la tabla de precios"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son los lineamientos para Pool de Datos?",
        "answers": [
        "Aplica únicamente entre planes y servicios adicionales de datos con la misma cantidad de MB incluidos. El pool de datos únicamente aplica para planes sin redirect",
        "Aplica solo entre planes de voz",
        "Aplica solo para servicios de datos",
        "Aplica para todos los servicios"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el límite de crédito al que se le puede incrementar una línea que tiene menos de 3 meses en Telcel sin dejar depga?",
        "answers": [
        "El doble del original",
        "El triple del original",
        "La mitad del original",
        "El mismo que el original"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuándo se regresa el depga en cambio de forma de pago?",
        "answers": [
        "Después de haber pasado el primer cargo a TC",
        "Inmediatamente después del cambio",
        "Después de tres meses",
        "Nunca se regresa"
        ],
        "correct": 0
    },
    {
        "question": "Cuando una línea está en AB (abogados) y cobranza extrajudicial la saca, ¿en qué estatus queda?",
        "answers": [
        "AR",
        "EN",
        "CA",
        "PE"
        ],
        "correct": 0
    },
    {
        "question": "¿Quién saca a las líneas de (AB) abogados?",
        "answers": [
        "Cobranza extrajudicial",
        "El usuario",
        "El administrador de la cuenta",
        "Soporte técnico"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el aumento de límite de crédito que puede hacerse a líneas corporativas con menos de 6 meses?",
        "answers": [
        "2 veces el límite original",
        "3 veces el límite original",
        "La mitad del límite original",
        "Sin aumento"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuántos días tiene el área de cobranza corporativa para mandar a COBEXT una cuenta que se mandará a afianzadora si la clase de crédito es MB, BU o RE?",
        "answers": [
        "149 días",
        "89 días",
        "120 días",
        "180 días"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuántos días tiene el área de cobranza corporativa para mandar a COBEXT una cuenta que se mandará a afianzadora si es de alto riesgo?",
        "answers": [
        "89 días",
        "149 días",
        "120 días",
        "180 días"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el documento contable con el que se realiza la cancelación de importes de servicios facturados por error o no reconocidos por el usuario?",
        "answers": [
        "Nota de Crédito",
        "Factura de cancelación",
        "Recibo de ajuste",
        "Comprobante de devolución"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué documento permite el traspaso de saldos de una cuenta a otra por pagos mal aplicados?",
        "answers": [
        "Formato de ajuste o devolución",
        "Nota de Crédito",
        "Factura de corrección",
        "Recibo de traspaso"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuánto tiempo debe transcurrir sin que aparezca saldo aplicado a un pago realizado en caja para considerar que debe realizarse una aclaración?",
        "answers": [
        "1 DÍA HÁBIL",
        "2 DÍAS HÁBILES",
        "3 DÍAS HÁBILES",
        "5 DÍAS HÁBILES"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el comando para enviar acciones de cobranza a cuentas nacionales para suspender?",
        "answers": [
        "SUS-CON-CLIMO",
        "SUS-CON-CORP",
        "SUS-CON-AB",
        "SUS-CON-RCO"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el comando para enviar acciones de cobranza a cuentas nacionales para reactivar?",
        "answers": [
        "RCO-CON-CLIMO",
        "RCO-CON-CORP",
        "RCO-CON-AB",
        "RCO-CON-SUS"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuántos días de gracia deben tener los clientes corporativos salvo autorización especial de la DEUR?",
        "answers": [
        "NINGUNO",
        "5 días",
        "10 días",
        "15 días"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es la acción que debe realizarse para reactivar una cuenta padre con responsabilidad de pago?",
        "answers": [
        "RPO",
        "REA",
        "SUS",
        "RCO"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué clase de crédito debe asignarse a las líneas monitoreadas por límite de uso no consolidadas o consolidadas con responsabilidad de pago en las hijas?",
        "answers": [
        "A1",
        "A2",
        "A3",
        "A4"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué clase de crédito debe asignarse a las líneas monitoreadas por límite de uso que estén consolidadas con responsabilidad de pago en la cuenta padre?",
        "answers": [
        "A2",
        "A1",
        "A3",
        "A4"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué límite de crédito se le debe asignar a una línea corporativa?",
        "answers": [
        "La que por default le corresponda al plan",
        "El doble del límite del plan",
        "La mitad del límite del plan",
        "Un límite definido por el usuario"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué condiciones cubre una línea en alto riesgo para pasar a regular?",
        "answers": [
        "Contar con 6 meses de buen historial de pago",
        "No tener deudas pendientes",
        "Pagar una tarifa adicional",
        "Solicitar una evaluación"
        ],
        "correct": 0
    },
    {
        "question": "¿Bajo qué condiciones un asesor puede dar más de 1 PPA en un periodo?",
        "answers": [
        "Cuando el motivo sea imputable a Telcel y la promesa de pago dada previamente no haya sido suficiente para regularizar la cuenta",
        "Cuando el usuario lo solicite",
        "Cuando la cuenta tenga más de 3 meses",
        "Cuando se cambie de plan"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el límite de crédito de un asesor corporativo?",
        "answers": [
        "$5,000.00",
        "$10,000.00",
        "$3,000.00",
        "$7,500.00"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué acción se da a una línea que está suspendida para reactivarla?",
        "answers": [
        "REA",
        "RPO",
        "SUS",
        "RCO"
        ],
        "correct": 0
    },
    {
        "question": "En un cliente AR, ¿en qué porcentaje se realiza el enrutamiento de la línea?",
        "answers": [
        "80%",
        "50%",
        "60%",
        "100%"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es la recomendación para reactivación de líneas canceladas con adeudo (ACJPM)?",
        "answers": [
        "Que la cuenta esté en estatus EX o PE",
        "Que la cuenta esté en estatus AR",
        "Que la cuenta esté en estatus EN",
        "Que la cuenta esté en estatus CA"
        ],
        "correct": 0
    },
    {
        "question": "Si un cliente corporativo se encuentra en AR y solicita aumento de límite de consumo, ¿cuánto se le da y cuánto necesita?",
        "answers": [
        "4 veces el límite original de su límite de consumo y depga igual a la diferencia en límite requerido y el original del plan",
        "3 veces el límite original de su límite de consumo",
        "2 veces el límite original de su límite de consumo",
        "El mismo límite original de su plan"
        ],
        "correct": 0
    },
    {
        "question": "¿A las cuentas con clase de crédito AR se les puede hacer promesa de pago?",
        "answers": [
        "NO",
        "SÍ, con autorización especial",
        "SÍ, bajo ciertas condiciones",
        "DEPENDE del caso"
        ],
        "correct": 0
    },
    {
        "question": "Una línea con buen historial solicita aumento de límite de crédito después de 6 meses. ¿Cuánto se le puede aumentar?",
        "answers": [
        "25%",
        "10%",
        "15%",
        "20%"
        ],
        "correct": 0
    },
    {
        "question": "A los clientes activos se les puede incrementar un 25% del límite de crédito original cada 6 meses, siempre y cuando cumplan con:",
        "answers": [
        "Tener 6 meses activo, no tener saldos vencidos en ninguna de sus líneas, no haber sido suspendido más de 2 veces por morosidad durante los últimos 6 meses",
        "Tener 3 meses activo, no tener saldos vencidos",
        "Tener 12 meses activo, no tener morosidad",
        "Tener 6 meses activo, tener al menos una línea sin saldo vencido"
        ],
        "correct": 0
    },
    {
        "question": "Se considera una aclaración de pago cuando ya transcurrieron más de 3 días hábiles después del mismo y no aparece aplicado. Transcurrido ese tiempo, ¿quién está en posibilidades de tramitar la aclaración?",
        "answers": [
        "El Analista de Crédito y Cobranza que le corresponda",
        "El Administrador de la cuenta",
        "El Cliente",
        "Soporte técnico"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué clase de cobranza tienen los clientes corporativos?",
        "answers": [
        "SI",
        "NO",
        "DEPENDE",
        "N/A"
        ],
        "correct": 0
    },
    {
        "question": "La clase de cobranza NU solo se puede dar a un cliente, ¿quién lo autoriza?",
        "answers": [
        "LA DEUR",
        "El Administrador de la cuenta",
        "El Cliente",
        "Soporte técnico"
        ],
        "correct": 0
    },
    {
        "question": "A una cuenta suspendida por límite de uso, ¿puede aplicarse promesa de pago y por qué?",
        "answers": [
        "No, ya que la efectividad del límite de uso se pierde",
        "Sí, para mantener la cuenta activa",
        "DEPENDE del caso",
        "Sí, con autorización especial"
        ],
        "correct": 0
    },
    {
        "question": "¿Cómo se quita un enrutamiento EM?",
        "answers": [
        "BME",
        "SUS",
        "RCO",
        "REA"
        ],
        "correct": 0
    },
    {
        "question": "¿Cómo se quita una SP?",
        "answers": [
        "BRC",
        "SUS",
        "RCO",
        "REA"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es SIPAB?",
        "answers": [
        "SISTEMA INTEGRAL DE PAGOS, AJUSTES Y BONIFICACIONES",
        "Sistema de Información y Pago Bancario",
        "Sistema de Integración de Pagos",
        "Servicio Integral de Pagos y Beneficios"
        ],
        "correct": 0
    },
    {
        "question": "Formato de calidad que sustituye a la nota de cargo en caso de no contar con SIPAB",
        "answers": [
        "F-00.09.01.03.02-007 formato de ajuste o devolución",
        "F-00.08.01.03.02-005 formato de ajuste",
        "F-00.10.01.03.02-009 formato de devolución",
        "F-00.11.01.03.02-001 formato de pago"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuántos días a otorgar de PPA a una cuenta suspendida por límite de crédito y con forma de pago cargo a tarjeta de crédito?",
        "answers": [
        "3",
        "5",
        "10",
        "15"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué significa RAP?",
        "answers": [
        "LINEA DE CAPTURA UTILIZADA POR EL BANCO HSBC PARA LA APLICACIÓN DE PAGOS EN LAS CUENTAS DE LOS CLIENTES TELCEL",
        "Red de Aplicación de Pagos",
        "Reporte de Ajustes y Pagos",
        "Registro de Aplicación de Pagos"
        ],
        "correct": 0
    },
    {
        "question": "¿Quién autoriza bonificación con monto mayor a $5,001.00?",
        "answers": [
        "CALIDAD Y CULTURA CORPORATIVA",
        "El Administrador de la cuenta",
        "El Cliente",
        "Soporte técnico"
        ],
        "correct": 0
    },
    {
        "question": "¿En qué fecha se da la concesión para explotar la red de servicio telefónico móvil a Radiomovil DIPSA?",
        "answers": [
        "1984",
        "1985",
        "1983",
        "1986"
        ],
        "correct": 0
    },
    {
        "question": "¿En qué año y dónde surge la marca Telcel a ofrecer los servicios de telefonía celular?",
        "answers": [
        "1989 en Tijuana",
        "1990 en Ciudad de México",
        "1988 en Guadalajara",
        "1991 en Monterrey"
        ],
        "correct": 0
    },
    {
        "question": "¿En qué fecha entraron en vigor las leyes secundarias?",
        "answers": [
        "12 de Agosto de 2014",
        "10 de Agosto de 2014",
        "15 de Agosto de 2014",
        "20 de Agosto de 2014"
        ],
        "correct": 0
    },
    {
        "question": "¿A partir de qué fecha se considera que Telcel es agente económico preponderante?",
        "answers": [
        "6 de abril 2014",
        "5 de abril 2014",
        "7 de abril 2014",
        "8 de abril 2014"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué incluye la MISIÓN de Telcel?",
        "answers": [
        "Brindamos la mejor experiencia de servicio a través de las más avanzadas soluciones de comunicación, tecnología de información y contenido digital para acelerar el desarrollo de los países donde operamos y promover la igualdad de oportunidades entre la gente",
        "Ofrecer planes de telefonía móvil económicos",
        "Ser el mayor proveedor de servicios de telecomunicación en Latinoamérica",
        "Implementar tecnologías innovadoras en todas las áreas de negocio"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué incluye la VISIÓN de Telcel?",
        "answers": [
        "Consolidarnos como un agente de cambio al proporcionar servicios de conectividad y alta tecnología; preservando nuestro liderazgo en la industria de las telecomunicaciones y reafirmando nuestro compromiso con las personas para hacer un mundo más próspero para todos",
        "Ser la empresa más rentable de telecomunicaciones",
        "Expandir nuestra presencia a nivel mundial",
        "Ofrecer los precios más bajos del mercado"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son los VALORES de Telcel?",
        "answers": [
        "Experiencia del cliente, innovación, personas/desarrollo humano, sustentabilidad, integridad, eficiencia y colaboración",
        "Rentabilidad, expansión, liderazgo, tecnología",
        "Calidad, servicio al cliente, innovación, eficiencia",
        "Integridad, compromiso, sustentabilidad, calidad"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es la Política de Calidad de Telcel?",
        "answers": [
        "Satisfacer permanentemente los requisitos de nuestros clientes a través del trabajo en equipo y dentro de un proceso de mejora continua",
        "Ofrecer servicios de alta calidad a precios competitivos",
        "Innovar constantemente en nuestros productos y servicios",
        "Garantizar la satisfacción del cliente a toda costa"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué forman parte de la Cultura Corporativa de Telcel?",
        "answers": [
        "MISIÓN, VISIÓN, VALORES Y OBJETIVOS INSTITUCIONALES",
        "Calidad, innovación y servicio",
        "Rentabilidad, liderazgo y tecnología",
        "Expansión, desarrollo humano y eficiencia"
        ],
        "correct": 0
    },
    {
        "question": "¿Según la política de calidad, los requisitos de quién debemos cubrir?",
        "answers": [
        "Los de nuestros clientes, pero también: La satisfacción del cliente, La seguridad de la información, Los servicios de TI, La seguridad y salud de los trabajadores, Los aplicables (legales, gubernamentales, del producto, establecidos por Telcel y los descritos en las Normas que integran el SGI)",
        "Solo los de nuestros clientes",
        "Solo los establecidos por Telcel",
        "Solo los legales y gubernamentales"
        ],
        "correct": 0
    },
    {
        "question": "La misión de Telcel incluye los conceptos de:",
        "answers": [
        "Liderazgo, excelencia, bienestar y comunidad",
        "Rentabilidad, expansión y liderazgo",
        "Tecnología, innovación y eficiencia",
        "Servicio al cliente, calidad y compromiso"
        ],
        "correct": 0
    },
    {
        "question": "La política de calidad incluye los conceptos de:",
        "answers": [
        "Satisfacción de requisitos, trabajo en equipo y mejora continua",
        "Calidad del servicio, innovación y eficiencia",
        "Liderazgo, compromiso y desarrollo humano",
        "Tecnología, expansión y calidad"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son los Objetivos Institucionales de Telcel?",
        "answers": [
        "Satisfacción de usuarios, Crecimiento en clientes, Rentabilidad, Liderazgo, Cumplimiento y sustentabilidad",
        "Rentabilidad, expansión, tecnología, liderazgo",
        "Calidad, servicio al cliente, innovación, eficiencia",
        "Integridad, compromiso, sustentabilidad, calidad"
        ],
        "correct": 0
    },
    {
        "question": "¿Cada cuánto se establecen los objetivos institucionales?",
        "answers": [
        "Anualmente",
        "Mensualmente",
        "Trimestralmente",
        "Semestralmente"
        ],
        "correct": 0
    },
    {
        "question": "¿Quién es responsable de identificar los objetivos en los que contribuye con sus actividades diarias?",
        "answers": [
        "El personal",
        "El administrador",
        "El gerente",
        "El supervisor"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es calidad de acuerdo al sitio de calidad?",
        "answers": [
        "Conjunto de características inherentes que cumple con las necesidades o expectativas, establecidas generalmente implícitas u obligatorias. Cumplir con los requisitos de cualquier producto o servicio",
        "Ofrecer servicios a precios competitivos",
        "Garantizar la satisfacción del cliente a toda costa",
        "Implementar tecnologías innovadoras en todas las áreas de negocio"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es la definición de calidad utilizada en Telcel?",
        "answers": [
        "Cumplir con los requisitos de los clientes",
        "Ofrecer productos de alta calidad",
        "Garantizar la satisfacción del cliente",
        "Implementar tecnologías innovadoras"
        ],
        "correct": 0
    },
    {
        "question": "¿Por qué implementar un sistema de calidad?",
        "answers": [
        "Para ser más eficaces y eficientes para satisfacer a los clientes",
        "Para reducir costos",
        "Para expandir el negocio",
        "Para mejorar la tecnología"
        ],
        "correct": 0
    },
    {
        "question": "¿Por qué es importante escuchar a nuestros clientes?",
        "answers": [
        "Para entender lo que necesitan",
        "Para aumentar las ventas",
        "Para mejorar la tecnología",
        "Para expandir el negocio"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el ciclo para identificar los requisitos de nuestros clientes?",
        "answers": [
        "Escuchar, preguntar, repetir",
        "Evaluar, implementar, verificar",
        "Planificar, hacer, revisar",
        "Investigar, analizar, implementar"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué documento describe de manera general el cumplimiento a los requisitos de los estándares del sistema de Gestión Integrado de Radiomovil Dipsa, S.A. de C.V.?",
        "answers": [
        "Manual del Sistema de Gestión Integrado (MC-00.00.00.00.00-001)",
        "Manual de Calidad",
        "Política de Calidad",
        "Procedimiento de Calidad"
        ],
        "correct": 0
    },
    {
        "question": "¿Por qué es importante llevar a cabo la revisión por la Dirección al SGI?",
        "answers": [
        "Porque con ella se asume la total responsabilidad y rendición de cuentas a la efectividad del sistema",
        "Para mejorar los procesos",
        "Para garantizar la satisfacción del cliente",
        "Para reducir costos"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuáles son los principios de la gestión de la calidad?",
        "answers": [
        "Enfoque al cliente, liderazgo, compromiso de las personas, enfoque a procesos, mejora, toma de decisiones basada en la evidencia, gestión de relaciones",
        "Calidad del servicio, innovación, eficiencia, liderazgo",
        "Tecnología, expansión, calidad, servicio al cliente",
        "Integridad, compromiso, sustentabilidad, calidad"
        ],
        "correct": 0
    },
    {
        "question": "Este proceso determina los factores internos y externos que influyen en el propósito, objetivos y sostenibilidad de la organización.",
        "answers": [
        "Contexto de la organización",
        "Análisis interno",
        "Evaluación de riesgos",
        "Planificación estratégica"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el objetivo del manual del sistema de gestión integrado?",
        "answers": [
        "Que se pueda comprender la Organización, los procesos y la interpretación particular de RADIOMÓVIL DIPSA S.A. DE C.V., hacia los requisitos establecidos por la norma ISO 9001:2008",
        "Desarrollar normas de calidad",
        "Implementar tecnologías innovadoras",
        "Garantizar la satisfacción del cliente"
        ],
        "correct": 0
    },
    {
        "question": "¿Quién revisa el Manual de Calidad?",
        "answers": [
        "El Comité de Implementación del Sistema de Calidad de RADIOMÓVIL DIPSA S.A. DE C.V.",
        "El Administrador de la cuenta",
        "El Cliente",
        "Soporte técnico"
        ],
        "correct": 0
    },
    {
        "question": "Documento donde se encuentra la descripción de los procesos estratégicos orientados al negocio, cliente y soporte de Telcel.",
        "answers": [
        "Red de procesos",
        "Manual de Calidad",
        "Política de Calidad",
        "Procedimiento de Calidad"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el sistema donde puedes consultar la documentación aplicable al sistema de gestión integrado?",
        "answers": [
        "@Doc",
        "Portal de Calidad",
        "Sistema Integrado de Gestión",
        "Red de procesos"
        ],
        "correct": 0
    },
    {
        "question": "¿En dónde puedo encontrar la medición de los objetivos del SGI?",
        "answers": [
        "En el portal de calidad",
        "En el sistema @Doc",
        "En la Red de procesos",
        "En el Manual de Calidad"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es la principal forma de almacenamiento del conocimiento de la organización?",
        "answers": [
        "Son los procedimientos que especifican cómo se realizan las actividades cotidianas, se encuentra en el sistema @doc",
        "Son los manuales de calidad",
        "Es el portal de calidad",
        "Es la red de procesos"
        ],
        "correct": 0
    },
    {
        "question": "Ventas, activaciones, servicio celular, servicio a clientes, crédito y cobranza, son áreas que forman parte de:",
        "answers": [
        "Proceso de negocios de Telcel",
        "Red de procesos",
        "Sistema de gestión integrado",
        "Portal de calidad"
        ],
        "correct": 0
    },
    {
        "question": "¿En qué año se liberó el portal de calidad?",
        "answers": [
        "2011",
        "2010",
        "2009",
        "2012"
        ],
        "correct": 0
    },
    {
        "question": "¿En qué fecha se certifica Radiomovil DIPSA en ISO?",
        "answers": [
        "25 de marzo de 2003",
        "1 de enero de 2010",
        "12 de agosto de 2014",
        "6 de abril de 2014"
        ],
        "correct": 0
    },
    {
        "question": "¿En qué fecha entró en operación el sistema @DOC?",
        "answers": [
        "1 de enero de 2010",
        "25 de marzo de 2003",
        "12 de agosto de 2014",
        "6 de abril de 2014"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el objetivo de IS0 9000?",
        "answers": [
        "Desarrollar y promover normas internacionales de calidad",
        "Garantizar la satisfacción del cliente",
        "Implementar tecnologías innovadoras",
        "Reducir costos"
        ],
        "correct": 0
    },
    {
        "question": "Son temas comunes dentro del sistema de Calidad en la Intranet Corporativa:",
        "answers": [
        "La calidad, ISO, procesos, procedimientos y comentarios",
        "Innovación, tecnología, eficiencia y liderazgo",
        "Servicio al cliente, calidad y compromiso",
        "Rentabilidad, expansión y liderazgo"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es un requisito de acuerdo a la norma ISO 9001?",
        "answers": [
        "Necesidad o expectativa establecida, generalmente implícita u obligatoria",
        "Documento que describe un proceso",
        "Política de calidad",
        "Manual de calidad"
        ],
        "correct": 0
    },
    {
        "question": "Según la norma ISO, ¿qué es un procedimiento?",
        "answers": [
        "Es el modo de ejecutar determinadas acciones que suelen realizarse de la misma forma. Son una serie común de pasos claramente definidos. Forma específica de llevar a cabo una actividad o proceso",
        "Es un documento de políticas",
        "Es un manual de calidad",
        "Es una política de calidad"
        ],
        "correct": 0
    },
    {
        "question": "Definición del Problema:",
        "answers": [
        "Descripción del problema real o potencial basándose en datos, mediciones o estadísticas, de hechos reales y medibles",
        "Análisis de una situación problemática",
        "Proceso para solucionar un conflicto",
        "Evaluación de un incidente"
        ],
        "correct": 0
    },
    {
        "question": "Acción Preventiva:",
        "answers": [
        "Acción tomada para eliminar las causas potenciales de una no conformidad y prevenir su ocurrencia. / Identificación de riesgos para implementar controles y estar preparados ante eventos que puedan afectar la seguridad de la información",
        "Acción tomada para corregir un problema",
        "Proceso para mejorar la calidad",
        "Medida para solucionar un conflicto"
        ],
        "correct": 0
    },
    {
        "question": "Acción Correctiva:",
        "answers": [
        "Acción tomada para eliminar la causa raíz de una no conformidad u otra situación indeseable que se presente en determinada circunstancia, a fin de prevenir su recurrencia. Acciones con el objeto de solucionar problemas sistemáticos relevantes a los procesos por medio del análisis de la información que revisen periódicamente o como resultado de no conformidades",
        "Acción para mejorar la calidad",
        "Medida para solucionar un conflicto",
        "Proceso para implementar tecnologías innovadoras"
        ],
        "correct": 0
    },
    {
        "question": "Acción de Mejora:",
        "answers": [
        "Acción definida para cambiar una situación actual por una nueva condición que brinda beneficios. Una acción que decide emprender la Alta Dirección una vez que se han logrado los objetivos, a fin de alcanzar nuevos niveles de eficacia e incorporar mejores prácticas, tecnologías o innovaciones",
        "Acción para eliminar una no conformidad",
        "Medida para solucionar un conflicto",
        "Proceso para evaluar un problema"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es mejora continua?",
        "answers": [
        "Actividad recurrente para alimentar la capacidad de cumplir con los requisitos del servicio. Significa aplicar el ciclo: PLANEAR, HACER, MEDIR Y MEJORAR",
        "Proceso de innovación constante",
        "Evaluación periódica de los procesos",
        "Análisis de los requisitos del cliente"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el nombre del sistema que administra las acciones correctivas y de mejora?",
        "answers": [
        "Sistema de mejora continua",
        "Sistema de gestión integrado",
        "Red de procesos",
        "Manual de calidad"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué tipo de acciones se registran en el sistema de mejora continua?",
        "answers": [
        "Acciones correctivas y de mejora",
        "Acciones preventivas y de control",
        "Acciones estratégicas y operativas",
        "Acciones de evaluación y análisis"
        ],
        "correct": 0
    },
    {
        "question": "De acuerdo al procedimiento de acciones para la mejora continua, ¿cuál es la finalidad de implementar acciones correctivas y preventivas, y de mejora?",
        "answers": [
        "Establecer un programa de auditorías internas de cuyo resultado se informa a cada una de las direcciones",
        "Mejorar la calidad del servicio",
        "Aumentar la eficiencia",
        "Garantizar la satisfacción del cliente"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es la responsabilidad de la alta dirección cuando se documenta una acción para la mejora?",
        "answers": [
        "Facilitar, los recursos, supervisar los avances y tomar las acciones correspondientes cuando no haya avances",
        "Revisar el manual de calidad",
        "Implementar nuevas tecnologías",
        "Garantizar la satisfacción del cliente"
        ],
        "correct": 0
    },
    {
        "question": "En Telcel, ¿quién puede identificar la necesidad de resolver un problema o mejorar la situación actual?",
        "answers": [
        "Todos los empleados",
        "El administrador",
        "El gerente",
        "El supervisor"
        ],
        "correct": 0
    },
    {
        "question": "Corrección:",
        "answers": [
        "Acción tomada para eliminar una no conformidad detectada",
        "Acción para mejorar la calidad",
        "Medida para solucionar un conflicto",
        "Proceso para implementar tecnologías innovadoras"
        ],
        "correct": 0
    },
    {
        "question": "Acción Contenedora o de emergencia:",
        "answers": [
        "Acción de contención inmediata para permitir que se continúe trabajando en tanto se elimina la causa raíz",
        "Acción para eliminar una no conformidad",
        "Medida para solucionar un conflicto",
        "Proceso para evaluar un problema"
        ],
        "correct": 0
    },
    {
        "question": "Procedimiento que describe las actividades para controlar el producto que no cumple con los requisitos:",
        "answers": [
        "Atención de Producto No Conforme",
        "Manual de Calidad",
        "Política de Calidad",
        "Red de procesos"
        ],
        "correct": 0
    },
    {
        "question": "Las No conformidades dentro del sistema de Calidad se pueden clasificar en:",
        "answers": [
        "Mayores y Menores",
        "Importantes y Secundarias",
        "Críticas y No críticas",
        "Relevantes e Irrelevantes"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es una no conformidad menor?",
        "answers": [
        "Un caso aislado. No afecta la satisfacción del cliente ni la confiabilidad en el SGI",
        "Un problema grave",
        "Una falla repetitiva",
        "Una no conformidad crítica"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es una no conformidad mayor?",
        "answers": [
        "La ausencia total del cumplimiento de un requisito del sistema de calidad",
        "Una falla aislada",
        "Un problema menor",
        "Una no conformidad secundaria"
        ],
        "correct": 0
    },
    {
        "question": "Identificación de causa raíz:",
        "answers": [
        "Descripción de las causas del problema real o potencial, identificadas con el apoyo de herramientas de calidad (técnicas de análisis como: Los 5 ¿por qué?, Tormenta de Ideas, etc.)",
        "Evaluación del problema",
        "Proceso para solucionar un conflicto",
        "Análisis de los datos"
        ],
        "correct": 0
    },
    {
        "question": "Acción propuesta:",
        "answers": [
        "Acción correctiva o preventiva que elimina el problema real o potencial",
        "Medida para solucionar un conflicto",
        "Proceso para implementar tecnologías innovadoras",
        "Acción para mejorar la calidad"
        ],
        "correct": 0
    },
    {
        "question": "Tiene como fin cumplir los objetivos o condiciones que estén en riesgo de no alcanzarse:",
        "answers": [
        "Acciones preventivas",
        "Acciones correctivas",
        "Medidas de control",
        "Estrategias de mejora"
        ],
        "correct": 0
    },
    {
        "question": "¿Qué es cliente?",
        "answers": [
        "Organización o parte de la organización que recibe un servicio o servicios",
        "Persona que compra un producto",
        "Usuario final de un servicio",
        "Empresa que contrata servicios"
        ],
        "correct": 0
    },
    {
        "question": "¿Cómo se define el enfoque al cliente?",
        "answers": [
        "Cumplir con los requisitos + exceder las expectativas",
        "Garantizar la satisfacción del cliente",
        "Proporcionar un buen servicio",
        "Mejorar la calidad"
        ],
        "correct": 0
    },
    {
        "question": "¿Cuál es el beneficio que obtiene una organización cuando los servicios se entregan de acuerdo con ISO/IEC 20000?",
        "answers": [
        "La organización se comporta de una forma socialmente responsable",
        "Aumenta la rentabilidad",
        "Reduce costos",
        "Mejora la calidad del servicio"
        ],
        "correct": 0
    },
    {
        "question": "Son los responsables de autorizar el inicio de acciones correctivas y de mejora, aprobar al líder y la integración de un equipo de trabajo para acciones en el sistema de mejora continua:",
        "answers": [
        "Personal perteneciente a la alta dirección: Director, Subdirector o Gerente",
        "El administrador de la cuenta",
        "El cliente",
        "Soporte técnico"
        ],
        "correct": 0
    },
];
