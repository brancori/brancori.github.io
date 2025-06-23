        const data = {
            generales: [
                {pregunta: "¿La altura del área de trabajo es ajustable o adecuada a la estatura del operador (nivel de codo o ligeramente por debajo)?", peso: 3, metodo: 'REBA'},
                {pregunta: "¿Herramientas, materiales y controles de uso frecuente están ubicados dentro de la zona de alcance cómodo?", peso: 3, metodo: 'RULA'},
                {pregunta: "¿Las superficies de trabajo son estables, limpias y permiten distintos tipos de tareas?", peso: 1},
                {pregunta: "¿Se permite trabajar sentado para tareas de precisión o inspección visual detallada?", peso: 1},
                {pregunta: "¿Se aprovecha al máximo la iluminación natural en áreas de trabajo?", peso: 2},
                {pregunta: "¿Se emplean colores claros en paredes y techos para mejorar la iluminación indirecta y reducir la fatiga visual?", peso: 1},
                {pregunta: "¿La zona de trabajo está iluminada uniformemente, evitando contrastes extremos?", peso: 2},
                {pregunta: "¿Cada trabajador dispone de iluminación suficiente para operar de forma segura y eficiente?", peso: 3},
                {pregunta: "¿Se usa iluminación localizada en tareas de inspección o precisión?", peso: 2, metodo: 'RULA'},
                {pregunta: "¿Las fuentes de luz están apantalladas o reubicadas para evitar deslumbramientos?", peso: 2},
                {pregunta: "¿Se han eliminado reflejos molestos o superficies brillantes que obliguen al trabajador a modificar su postura visual?", peso: 2, metodo: 'RULA'},
                {pregunta: "¿El fondo de la tarea visual favorece la visibilidad en tareas continuas?", peso: 1},
                {pregunta: "¿Se cuenta con extracción localizada eficaz en zonas críticas?", peso: 3},
                {pregunta: "¿Se usa ventilación natural cuando es posible para mantener el confort térmico?", peso: 1},
                {pregunta: "¿Se mantiene en buen estado el sistema de ventilación general y local?", peso: 2},
                {pregunta: "¿El ruido no interfiere con la comunicación, seguridad ni eficiencia del trabajo?", peso: 3},
                {pregunta: "¿Se han implementado soluciones que reduzcan el ruido ambiental en estaciones de trabajo donde se requiere concentración?", peso: 2},
                {pregunta: "¿El nivel de ruido en el área permite una comunicación efectiva y no genera fatiga auditiva durante tareas prolongadas?", peso: 3},
                {pregunta: "¿Se dispone de vestuarios y servicios higiénicos limpios y en buen estado?", peso: 1},
                {pregunta: "¿Hay áreas designadas para comidas, descanso y bebidas disponibles?", peso: 1},
                {pregunta: "¿Se han identificado previamente quejas musculoesqueléticas o lesiones por parte del personal en esta área?", peso: 3},
                {pregunta: "¿Se ubican stocks intermedios entre procesos para evitar presión de tiempo?", peso: 1},
                {pregunta: "¿Se consideran habilidades y preferencias de los trabajadores en su asignación?", peso: 2},
                {pregunta: "¿Se adaptan estaciones y equipos para personas con discapacidad?", peso: 2}
            ],
            condicionales: {
                manipulaCargas: [
                    {pregunta: "¿Las rutas internas de transporte están claramente señalizadas, libres de obstáculos y cumplen con protocolos de limpieza?", peso: 2},
                    {pregunta: "¿Los pasillos tienen ancho suficiente para permitir el tránsito simultáneo de carritos o racks bidireccionales?", peso: 2},
                    {pregunta: "¿Las superficies de rodamiento son planas, antideslizantes, sin pendientes bruscas ni desniveles?", peso: 3},
                    {pregunta: "¿Se cuenta con rampas de inclinación máxima del 8% en lugar de escalones o desniveles en zonas de tránsito de materiales?", peso: 3},
                    {pregunta: "¿La disposición de los materiales minimiza el transporte manual dentro de cada área de trabajo?", peso: 3},
                    {pregunta: "¿Se utilizan carritos de acero inoxidable u otro material autorizado con ruedas de baja fricción para mover materiales?", peso: 3},
                    {pregunta: "¿Se emplean dispositivos móviles auxiliares (como carros intermedios) para evitar cargas innecesarias?", peso: 3},
                    {pregunta: "¿Hay estanterías ajustables en altura y cercanas a las estaciones de trabajo para reducir desplazamientos manuales?", peso: 3},
                    {pregunta: "¿Se utilizan ayudas mecánicas (grúas, elevadores de columna, poleas) para el movimiento de materiales pesados?", peso: 3, metodo: 'NIOSH', critica: true},
                    {pregunta: "¿Se han sustituido tareas de manipulación manual con sistemas automáticos como bandas transportadoras o transferencias neumáticas?", peso: 3},
                    {pregunta: "¿Los materiales se dividen en cargas menores (<25 kg según ISO 11228-1) para facilitar su manipulación segura?", peso: 3, metodo: 'NIOSH', critica: true},
                    {pregunta: "¿Los contenedores tienen asas ergonómicas, puntos de agarre visibles y permiten un agarre firme sin rotación de muñeca?", peso: 3, metodo: 'NIOSH'},
                    {pregunta: "¿Se han nivelado zonas de transferencia para evitar diferencias de altura en carga y descarga manual?", peso: 3, metodo: 'NIOSH'},
                    {pregunta: "¿Las tareas de alimentación y retiro de materiales se hacen horizontalmente mediante empuje o tracción, no mediante levantamiento?", peso: 3, metodo: 'NIOSH', critica: true},
                    {pregunta: "¿Las tareas de manipulación evitan posiciones forzadas como inclinaciones o torsiones de tronco?", peso: 3, metodo: 'REBA', critica: true},
                    {pregunta: "¿Los trabajadores mantienen las cargas pegadas al cuerpo y por debajo del nivel de los hombros durante el transporte manual?", peso: 3, metodo: 'NIOSH'},
                    {pregunta: "¿Las tareas manuales repetitivas se realizan durante más de 2 horas continuas sin variación?", peso: 3, metodo: 'OCRA', critica: true},
                    {pregunta: "¿El levantamiento y depósito de materiales se realiza con movimientos controlados, en el plano frontal del cuerpo y sin rotación?", peso: 3, metodo: 'NIOSH'},
                    {pregunta: "¿Para trayectos largos se utilizan mochilas, bolsas simétricas o medios que distribuyan la carga en ambos lados del cuerpo?", peso: 2},
                    {pregunta: "¿Las tareas de manipulación pesada se alternan con tareas más ligeras para evitar fatiga acumulativa?", peso: 2, metodo: 'OCRA'}
                ],
                usaPantallas: [
                    {pregunta: "¿Los puestos con pantallas permiten ajustes por parte del operador?", peso: 3, metodo: 'RULA'},
                    {pregunta: "¿Se combinan tareas ante pantalla con tareas físicas para evitar fatiga ocular?", peso: 1},
                    {pregunta: "¿Se permiten pausas cortas frecuentes en trabajos prolongados frente a pantalla?", peso: 1, metodo: 'OCRA'}
                ],
                usaHerramientas: [
                    {pregunta: "¿En tareas repetitivas se utilizan herramientas diseñadas específicamente para cada tarea (p. ej., pinzas, llaves, destornilladores calibrados)?", peso: 3, metodo: 'RULA', critica: true},
                    {pregunta: "¿Se emplean herramientas suspendidas en líneas de producción donde se realizan operaciones repetidas?", peso: 2, metodo: 'OCRA'},
                    {pregunta: "¿Se usan fijadores (como mordazas o tornillos de banco) para estabilizar piezas durante operaciones manuales?", peso: 2},
                    {pregunta: "¿Las herramientas de precisión ofrecen soporte ergonómico para la muñeca o el dorso de la mano?", peso: 3, metodo: 'RULA', critica: true},
                    {pregunta: "¿El peso de las herramientas está reducido al mínimo sin comprometer su funcionalidad?", peso: 2},
                    {pregunta: "¿Las herramientas requieren una fuerza mínima para ser operadas, considerando la variabilidad de los operadores?", peso: 3, metodo: 'RULA'},
                    {pregunta: "¿Los mangos de las herramientas tienen forma, diámetro y longitud adecuados al tamaño de la mano promedio del operador?", peso: 3, metodo: 'RULA'},
                    {pregunta: "¿Se cuenta con superficies antideslizantes o retenedores para evitar deslizamiento o pellizcos en el uso de herramientas?", peso: 2},
                    {pregunta: "¿Se han validado herramientas con bajo nivel de vibración y ruido conforme al perfil de riesgo del puesto?", peso: 3},
                    {pregunta: "¿Cada herramienta tiene su ubicación asignada en estaciones 5S o shadow boards?", peso: 2},
                    {pregunta: "¿Las estaciones de trabajo permiten una postura estable y ergonómica para usar herramientas con seguridad?", peso: 3, metodo: 'RULA', critica: true},
                    {pregunta: "¿Se han tomado medidas para reducir la vibración en equipos y herramientas?", peso: 3},
                    {pregunta: "¿Las herramientas y máquinas se mantienen en condiciones que reduzcan el esfuerzo auditivo del operador?", peso: 2}
                ],
                mantienePosturas: [
                    {pregunta: "¿Los operadores de menor estatura alcanzan controles y materiales sin forzar su postura?", peso: 2, metodo: 'REBA', critica: true},
                    {pregunta: "¿Los operadores altos tienen espacio suficiente para movimientos sin restricciones?", peso: 2},
                    {pregunta: "¿Se permite alternar entre estar de pie y sentado, dependiendo del tipo de tarea?", peso: 2, metodo: 'REBA', critica: true},
                    {pregunta: "¿Se dispone de sillas o banquetas para pausas cortas en tareas prolongadas de pie?", peso: 2},
                    {pregunta: "¿Las sillas para trabajos sentados son ajustables y tienen respaldo ergonómico?", peso: 3},
                    {pregunta: "¿Las superficies de trabajo permiten alternar tareas con objetos grandes y pequeños?", peso: 2},
                    {pregunta: "¿Se realiza rotación de tareas entre actividades con diferente exigencia física dentro del turno?", peso: 3, metodo: 'OCRA', critica: true},
                    {pregunta: "¿Existen pausas activas o pausas programadas que ayuden a mitigar la fatiga postural?", peso: 2, metodo: 'OCRA'},
                    {pregunta: "¿Se combinan tareas para diversificar el trabajo y reducir la fatiga?", peso: 2}
                ]
            }
        };

        export default data;