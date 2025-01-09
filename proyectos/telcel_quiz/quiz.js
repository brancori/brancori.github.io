const questions = [
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
    }

    // ... (Asegúrate de tener 600 preguntas en este array)
];

const totalQuestions = questions.length; // Contador del total de preguntas del dataset

function getRandomQuestions(questions, num) {
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

let selectedQuestions = getRandomQuestions(questions, 25);

let currentQuestionIndex = 0;
let correctAnswers = [];
let incorrectAnswers = [];
let score = 0;

const questionContainer = document.getElementById('question');
const questionCounter = document.getElementById('question-counter');
const datasetCounter = document.getElementById('dataset-counter'); // Nuevo contador del dataset
const answerButtons = document.querySelectorAll('.answer-button');
const nextButton = document.getElementById('next-button');
const resultContainer = document.getElementById('result-container');
const scoreDisplay = document.getElementById('score');
const correctQuestionsDisplay = document.getElementById('correct-questions');
const incorrectQuestionsDisplay = document.getElementById('incorrect-questions');

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = [];
    incorrectAnswers = [];
    selectedQuestions = getRandomQuestions(questions, 25);
    datasetCounter.innerText = `Total de preguntas en dataset: ${totalQuestions}`; // Actualiza el contador del dataset
    showQuestion();
}

function showQuestion() {
    resetState();
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    questionCounter.innerText = `Pregunta ${currentQuestionIndex + 1} de ${selectedQuestions.length}`;
    questionContainer.innerText = currentQuestion.question;
    
    const shuffledAnswers = [...currentQuestion.answers].sort(() => Math.random() - 0.5);
    shuffledAnswers.forEach((answer, index) => {
        const button = answerButtons[index];
        button.innerText = answer;
        button.disabled = false;
        button.classList.remove('selected');
        button.onclick = () => selectAnswer(currentQuestion.answers.indexOf(answer));
    });
}

function resetState() {
    nextButton.style.display = 'none';
    answerButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove('selected');
    });
}

function selectAnswer(selectedIndex) {
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    answerButtons.forEach(button => button.disabled = true);
    if (selectedIndex === currentQuestion.correct) {
        score++;
        if (!correctAnswers.includes(currentQuestion.question)) {
            correctAnswers.push(currentQuestion.question);
        }
    } else {
        if (!incorrectAnswers.includes(currentQuestion.question)) {
            incorrectAnswers.push(currentQuestion.question);
        }
    }
    nextButton.style.display = 'block';
}

nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < selectedQuestions.length) {
        showQuestion();
    } else {
        showResults();
    }
});

function showResults() {
    questionContainer.style.display = 'none';
    questionCounter.style.display = 'none';
    answerButtons.forEach(button => button.style.display = 'none');
    nextButton.style.display = 'none';
    resultContainer.style.display = 'block';
    scoreDisplay.innerText = `Tu puntuación: ${score}/${selectedQuestions.length}`;
    
    correctQuestionsDisplay.innerHTML = `<h3>Preguntas Correctas</h3><ul>${correctAnswers.map(question => `<li>${question}</li>`).join('')}</ul>`;
    incorrectQuestionsDisplay.innerHTML = `<h3>Preguntas Incorrectas</h3><ul>${incorrectAnswers.map(question => `<li class="incorrect">${question}</li>`).join('')}</ul>`;
}

// Inicializa el quiz
startQuiz();

