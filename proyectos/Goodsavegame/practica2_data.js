const inventoryData = [
    {
        "masterEventNo": "23758693",
        "whatHappened": "Se identifican señaléticas faltantes en el pasillo del cuarto de lavado, en cuarto de lavado y cuarto de revisores",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Laboratory / Laboratorio - Control de Calidad",
        "categoria": "Communication",
        "severidad": 2,
        "probabilidad": 6,
        "ponderacion": 12
    },
    {
        "masterEventNo": "18882893",
        "whatHappened": "Se encuentra material de vidrio roto en cuarto de lavado el cual estaba en resguardo, sin embargo representaba una condición insegura",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Laboratory / Laboratorio - Control de Calidad",
        "categoria": "Housekeeping",
        "severidad": 2,
        "probabilidad": 10,
        "ponderacion": 20
    },
    {
        "masterEventNo": "11933534",
        "whatHappened": "Al utilizar el equipo de filtración a vacío, me percaté de que el frasco de trampa para solventes estaba estrellado",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Laboratory / Laboratorio - Control de Calidad",
        "categoria": "Mechanical or system failure",
        "severidad": 2,
        "probabilidad": 6,
        "ponderacion": 12
    },
    {
        "masterEventNo": "77875943",
        "whatHappened": "Cafetera conectada en salas de capacitación sin atención, la sala estaba vacía en Viernes por la tarde, ya no se tenian planeadas mas reuniones en el sitio",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Office/Cubicle / Oficinas",
        "categoria": "Fire safety (incl. life safety)",
        "severidad": 2,
        "probabilidad": 6,
        "ponderacion": 12
    },
    {
        "masterEventNo": "23385419",
        "whatHappened": "Se observa un vaso de precipitados de vidrio que se encuentra fracturado de la parte superior",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Laboratory / Laboratorio - Control de Calidad",
        "categoria": "Mechanical or system failure",
        "severidad": 2,
        "probabilidad": 10,
        "ponderacion": 20
    },
    {
        "masterEventNo": "49488392",
        "whatHappened": "En el estacionamiento en la salida de los carros, pase la tarjeta y la flecha se abrió, demoré un par de  segundo de más y cuando avanzo la flecha cayo en el cofre del carro, entre el vidrio y el cofre, y al hacerme de reversa paso por todo el cofre",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Parking Garages/Lot/Sidewalks/Outdoors/Grounds / Estacionamiento",
        "categoria": "Mechanical or system failure",
        "severidad": 2,
        "probabilidad": null,
        "ponderacion": 8
    },
    {
        "masterEventNo": "27318712",
        "whatHappened": "Durante recorrido se observa daño en muro ocasionado por un golpe por parte del personal.",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Manufacturing/Operations / Fabricacin",
        "categoria": "Human factors",
        "severidad": 2,
        "probabilidad": 6,
        "ponderacion": 12
    },
    {
        "masterEventNo": "66479241",
        "whatHappened": "EL MOVEDOR COLOCO UNA TARIMA DE PT EN UN AREA QUE NO ES DESIGNADA PARA COLOCARLA POR LO QUE AL PASAR EL MOVEDOR CON OTRA TARIMA LE OBSTRUIA LA TARIMA QUE HABIA COLOCADO EN EL LUGAR",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Manufacturing/Operations / Acondicionado",
        "categoria": "Warehouse safety",
        "severidad": 2,
        "probabilidad": 6,
        "ponderacion": 12
    },
    {
        "masterEventNo": "97960132",
        "whatHappened": "Se encontró un plato roto y piso mojado junto a los contenedores de basura del comedor",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Cafeteria / Comedor",
        "categoria": "Slips trips & falls",
        "severidad": 2,
        "probabilidad": 10,
        "ponderacion": 20
    },
    {
        "masterEventNo": "56363671",
        "whatHappened": "Se identifica un acrilico que sujetado con la pared, en línea IMA que de 4 soportes, ya solo cuenta con dos, este pudiera caerse. El acrilico se encuentra en la pared que divide acondicionado secundario vs acondicionado primario entre la llenadora y el sellador de inducción Lepel",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Manufacturing/Operations",
        "categoria": "Falling objects",
        "severidad": 2,
        "probabilidad": 6,
        "ponderacion": 12
    },
    {
        "masterEventNo": "32870932",
        "whatHappened": "Se observa cofia en bote de residuos toallas de papel utilizadas para secado de manos ( disposición erronea de residuos)",
        "site": "Carretera Federal Mexico-Puebla...",
        "company": "Jen-CI Mexico",
        "siteLocation": "Manufacturing/Operations / Acondicionado",
        "categoria": "Waste",
        "severidad": 1,
        "probabilidad": 6,
        "ponderacion": 6
    },
    {
        "masterEventNo": "10052952",
        "whatHappened": "Se obstruyo la puerta con un carro de transporte de materiales el cual no permite abrir la puerta",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Manufacturing/Operations / Fabricacin",
        "categoria": "Emergency preparedness & response",
        "severidad": 4,
        "probabilidad": 6,
        "ponderacion": 24
    },
    {
        "masterEventNo": "15340409",
        "whatHappened": "Durante la ejecución de la actividad de pesada, se encuentre en el area de balanza, un objetivo punzocortante (punta de jeringa), el articulo se encuentra sin émbolo.",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Laboratory / Laboratorio - Control de Calidad",
        "categoria": "Materiales y agentes biológicos",
        "severidad": 2,
        "probabilidad": 4,
        "ponderacion": 8
    },
    {
        "masterEventNo": "73715133",
        "whatHappened": "Se encuentran en el area de charolas que contienen los desechos de fase movil del equipo 046, tachuelas de colores las cuales no tienen sentido de sitio.",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Laboratory / Laboratorio - Control de Calidad"
    },
    {
        "masterEventNo": "57811909",
        "whatHappened": "Se percibe un olor a quemado en el área de revisores, huele como a equipo quemado,las compañeras de Brillolimp, comentan que así normally huele, me comenta el Supervisor del area de Soporte que él personalmente a entrado al cuarto y ha notado que así huele cuando el horno está secando el material.",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Laboratory / Laboratorio - Control de Calidad",
        "categoria": "Fire safety (incl. life safety)",
        "severidad": 4,
        "probabilidad": 4,
        "ponderacion": 16
    },
    {
        "masterEventNo": "69888636",
        "whatHappened": "Se observa ingresar personal en moto sin usar casco, lo cual representa un riesgo para la persona y para los demas.",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Parking Garages/Lot/Sidewalks/Outdoors/Grounds / Estacionamiento",
        "categoria": "Seguridad de transporte",
        "severidad": 2,
        "probabilidad": 6,
        "ponderacion": 12
    },
    {
        "masterEventNo": "41594957",
        "whatHappened": "Durante el proceso de devolución de materiales se observó que una bobina de PVC de alrededor de 9 KG fue colocada en parte superior del anaquel existendo riesgo de lesión por carga.",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Manufacturing/Operations / Acondicionado",
        "categoria": "Manual Handling (Lifting, Push/Pull, Carrying)",
        "severidad": 2,
        "probabilidad": 6,
        "ponderacion": 12
    },
    {
        "masterEventNo": "39097746",
        "whatHappened": "La distribución del inmobiliario presenta un riesgo, el cual es un golpe en la cabeza al intentar pasar al escritorio debido los estantes que se encuentran en el cuarto",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Manufacturing/Operations / Fabricacin",
        "categoria": "Office safety",
        "severidad": 2,
        "probabilidad": 10,
        "ponderacion": 20
    },
    {
        "masterEventNo": "75731674",
        "whatHappened": "Se observa a una compañera (Daniela PAstor) esta sentada en un escritorio con el espacio y su alrededor invadidos por cajas y materiales pertenecientes a otras áreas, lo que ocasiona que lo tenga libre movilidad de pies y manos y la postula utilizada para permanecer en el lugar puede ocasionar afectación ergonómica.",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Manufacturing/Operations / Acondicionado",
        "categoria": "Computer Worstation",
        "severidad": 2,
        "probabilidad": 6,
        "ponderacion": 12
    },
    {
        "masterEventNo": "29878272",
        "whatHappened": "Se observa CPU sin tapa, lo cual genera que todos los cables esten expuestos y contaminación por polvo de la línea",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Manufacturing/Operations / Acondicionado",
        "categoria": "Electrical safety",
        "severidad": 2,
        "probabilidad": 4,
        "ponderacion": 8
    },
    {
        "masterEventNo": "17454379",
        "whatHappened": "Se visualiza a personal de microbiologia ingresando con una tipo mochila la cual es incomoda para traerla y abrir la puerta en un caso extremo puede lastimarse la mano, sufrir un tropiezo o bien lastimar a alguien mas ya que por ser incomoda no permite que tenga visibilidad para abrir la puerta e ir cargandola.",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Manufacturing/Operations / Fabricacin",
        "categoria": "Slips trips & falls",
        "severidad": 2,
        "probabilidad": 6,
        "ponderacion": 12
    },
    {
        "masterEventNo": "25255470",
        "whatHappened": "Al ingresar al vestidor rumbo a la salida una colaboradora fue golpeada al abrirse la puerta contigua de  entrada al vestidor",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Manufacturing/Operations / Acondicionado",
        "categoria": "Maintenance",
        "severidad": 1,
        "probabilidad": 10,
        "ponderacion": 10
    },
    {
        "masterEventNo": "15286572",
        "whatHappened": "Se encontró personal de soporte sin protección auditiva durante un proceso productivo cuando está descrito en el área el uso de este EPP",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Manufacturing/Operations / Fabricacin",
        "categoria": "Personal Protective Equipment",
        "severidad": 4,
        "probabilidad": 10,
        "ponderacion": 40
    },
    {
        "masterEventNo": "40890184",
        "whatHappened": "Se detecta que una silla corrediza tiene unas ruedas que ya se encuentran dañadas por lo tanto la silla se está inestable, lo que podría provocar una caída",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Manufacturing/Operations / Acondicionado",
        "categoria": "Slips trips & falls",
        "severidad": 2,
        "probabilidad": 10,
        "ponderacion": 20
    },
    {
        "masterEventNo": "97439433",
        "whatHappened": "Personal de Cajita Feliz  esta cargando cajas y esta entre los racks y no tiene equipo de seguridad (zapatos)",
        "site": "Carretera Federal Mexico-Puebla, Km 81.5, Huejotzingo, Puebla, Mexico",
        "company": "Jen-CI Mexico",
        "siteLocation": "Office/Cubicle / Oficinas",
        "categoria": "Personal Protective Equipment",
        "severidad": 2,
        "probabilidad": 6,
        "ponderacion": 12
    }
];

