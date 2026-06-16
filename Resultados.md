## **Propuesta de Agrupación: De 12 Categorías a 4 Blog Posts**

### **Post 1: El Cerebro y el Diseño del Agente (Fundamentos y Arquitectura)**

*Este post sienta las bases conceptuales y de diseño. Es el "cómo se piensa y se estructura" un agente antes de tirar la primera línea de código.*

* **Categorías asociadas:**  
  1. *Fundamentos de Agentes de IA y LLMs* (El motor cognitivo).  
  2. *Arquitectura de Agentes* (El plano estructural).  
  3. *Diseño de Workflows Agentic* (La lógica del proceso y toma de decisiones).

### **Post 2: Manos a la Obra: Conectividad, Herramientas y Memoria**

*Aquí abordas la construcción e interacción. Cómo el agente deja de ser un ente aislado y empieza a interactuar con el mundo exterior de forma inteligente.*

* **Categorías asociadas:** 4\. *Orquestación, Tooling e Integraciones* (Uso de frameworks como LangChain, CrewAI, AutoGen). 5\. *Gestión de Memoria y Contexto* (RAG, memoria a corto/largo plazo, permanencia). 6\. *Protocolos de integración de IA* (Cómo se comunican los agentes entre sí y con APIs/herramientas).

### **Post 3: De Local a Producción: Evaluación, Control y Escalabilidad**

*El paso crítico. Cómo asegurar que el agente no solo "funcione en mi máquina", sino que sea confiable, medible y capaz de crecer a nivel empresarial.*

* **Categorías asociadas:** 7\. *Evaluación de agentes* (Métricas cualitativas y cuantitativas, benchmarks). 8\. *Observabilidad y Control de Agentes* (Traces, logs, monitoreo de costos y comportamiento). 9\. *Evolución y Escalabilidad Agentic* (Ciclo de mejora continua y crecimiento del ecosistema).

### **Post 4: El Escudo Empresarial: Gobernanza, Seguridad e Impacto en el Negocio**

*El cierre estratégico. El software no vive en el vacío; necesita ser seguro, ético y mover la aguja del negocio para el que fue creado.*

* **Categorías asociadas:** 10\. *Gobernanza, Riesgo y Ética de Agentes* (Uso responsable y auditoría). 11\. *Seguridad de Agentes* (Guardrails, mitigación de prompt injections, privacidad de datos). 12\. *Integración con Procesos de Negocio* (Alineación con el ROI y generación de valor real).

## **Resumen de la Estructura en Tabla**

| Post \# | Enfoque Principal | Categorías Incluidas |
| :---- | :---- | :---- |
| **1\. Concepción** | Arquitectura y Pensamiento | Fundamentos LLM, Arquitectura, Workflows. |
| **2\. Construcción** | Acción e Interacción | Tooling, Memoria, Protocolos de Integración. |
| **3\. Operación** | Calidad y Escalabilidad | Evaluación, Observabilidad, Escalabilidad. |
| **4\. Estrategia** | Confianza y Negocio | Gobernanza, Seguridad (Guardrails), Impacto de Negocio. |

# Resultados assessment

Ingeniería de Agentes e Inteligencia Artificial Generativa  
Assessment Agentic AI  
De acuerdo al resultado se realizara la asignación de tu plan de estudio  
Cumple Aplica la habilidad correctamente y cumple con lo esperado de manera consistente.  
Cumple Parcialmente Muestra la habilidad de forma limitada o con errores que afectan el resultado.  
Excede Supera lo esperado, demostrando un dominio avanzado o aportes adicionales.  
No Cumple No demuestra la habilidad requerida o su desempeño es inapropiado o inexistente.  
Excede  
Fundamentos de Agentes de Inteligencia Artificial y LLMs  
Conocimiento técnico sobre cómo "piensan", procesan y generan información los modelos fundacionales para  
entender sus limitaciones y capacidades reales. 100%  
Excede  
Arquitectura de Agentes  
Diseñar arquitecturas de agentes alineadas a los sistemas, datos y procesos de la organización. 100%  
Excede  
Diseño de Workflows Agentic  
Estructurar flujos de trabajo agentic que automaticen tareas, decisiones y procesos complejos. 100%  
Excede  
Orquestación, Tooling e Integraciones  
Seleccionar y gobernar herramientas, frameworks y servicios que habiliten agentes confiables y sostenibles. 100%  
Excede  
Gestión de Memoria y Contexto  
Diseñar sistemas que permitan a los agentes recordar interacciones pasadas y mantener coherencia en  
conversaciones largas o tareas de múltiples pasos. 100%  
Excede  
Protocolos de integración de IA  
Estandarización la forma en que los agentes se conectan con el mundo exterior (herramientas) y cómo se  
comunican entre ellos. 100%  
Excede  
Evaluación de agentes  
Pasar de "funciona en mi máquina" a una ingeniería rigurosa mediante métricas cuantitativas y cualitativas antes  
del despliegue. 100%  
Excede  
Observabilidad y Control de Agentes  
Monitorear, auditar y controlar el comportamiento y desempeño de los agentes.v 100%  
Excede  
Evolución y Escalabilidad Agentic  
Asegurar que el ecosistema de agentes evolucione de forma sostenible y alineada a la estrategia. 100%  
Cumple  
Gobernanza, Riesgo y Ética de Agentes  
Garantizar el uso responsable, seguro y auditable de agentes en la organización. 80%  
Excede  
Seguridad de Agentes  
"Implementar capas de defensa técnica (""Guardrails"") para proteger a los agentes contra ataques adversarios,  
inyecciones de prompt y fugas de información sensible.  
(FUNDAMENTAL \- CONCEPTOS BÁSICOS)"  
100%  
Excede  
Integración con Procesos de Negocio  
Alinear los agentes con procesos críticos, objetivos de negocio y generación de valor.

# Respuestas del Assessment

Cuello de Botella en Cadena RAG  
https://gemini.google.com/share/d/1EZR6PJSV9zcYNqoaiF02cfLl8FiLRhG7  
La respuesta correcta es la D: Optimizar la infraestructura de búsqueda (Índices/Red); es el cuello de botella.

¿Por qué esta es la opción correcta?  
El problema nos presenta un desglose de tiempos dentro de una cadena de RAG (Retrieval-Augmented Generation):

Tiempo total de la cadena: 15 segundos.

Tiempo del LLM: 2 segundos.

Tiempo del "Retriever": 12 segundos.

El componente que está consumiendo la inmensa mayoría del tiempo (el 80% del total) es el Retriever. Por definición, un proceso que ralentiza drásticamente todo el sistema es un cuello de botella (bottleneck). Por lo tanto, cualquier esfuerzo de optimización debe enfocarse en la infraestructura de búsqueda, la indexación de los vectores o la red que conecta la base de datos vectorial para reducir esos 12 segundos.

¿Por qué las otras opciones no son correctas?  
A. Cambiar el modelo de Embedding por uno de menor dimensión: Aunque un modelo de menor dimensión puede acelerar ligeramente la búsqueda, la raíz del problema (12 segundos de demora) suele estar en una mala configuración de índices (como HNSW/IVF) o problemas de red/infraestructura, no puramente en la dimensionalidad del vector. Además, cambiar el modelo obliga a re-indexar absolutamente todo el dataset, lo cual no es el primer paso lógico sin antes optimizar la infraestructura actual.

B. Implementar Streaming para mejorar el Time-to-First-Token: El streaming mejora la percepción de velocidad del usuario final al mostrar el texto a medida que el LLM lo genera. Sin embargo, esto solo afecta a los 2 segundos del LLM; el usuario igual tendría que esperar los 12 segundos iniciales del Retriever antes de que empiece a salir el primer token. No soluciona el problema de raíz.

C. Optimizar el System Prompt para reducir la carga cognitiva: Modificar el prompt podría reducir levemente el tiempo de procesamiento del LLM, pero el LLM ya es bastante rápido (2 segundos). Reducir unas milésimas de segundo aquí no tiene un impacto real frente a los 12 segundos que se pierden buscando información.

La respuesta correcta es la A: Viola "Least Privilege" e infla costos y latencia por exceso de tokens.

¿Por qué esta es la opción correcta?  
El enunciado describe un escenario donde se envía el esquema (DDL) de todas las tablas de una base de datos al LLM, incluyendo información irrelevante como tablas de usuarios inactivos. Esto es una mala práctica por dos pilares fundamentales:

Seguridad (Least Privilege / Mínimo Privilegio): Al darle visibilidad al LLM sobre tablas que no necesita para su tarea actual (como datos confidenciales o históricos de usuarios inactivos), estás exponiendo innecesariamente la estructura interna de tus datos. Si el modelo sufre un ataque de Prompt Injection, un tercero podría extraer información sensible sobre la arquitectura de la base de datos.

Observabilidad y Rendimiento (Costos y Latencia): Los esquemas de bases de datos completas suelen ser masivos en texto. Enviar todo ese contexto innecesario consume una enorme cantidad de Input Tokens, lo que dispara el costo de la API y aumenta drásticamente el tiempo de respuesta (latencia) del modelo de lenguaje de manera injustificada.

¿Por qué las otras opciones son incorrectas o incompletas?  
B. Aumenta el riesgo de SQL Injection directa: Aunque el riesgo de inyección SQL existe al interactuar con agentes de datos, el hecho de enviar el esquema completo en el prompt no habilita directamente una inyección SQL por sí mismo. El peligro principal aquí es la sobreexposición de información y el desperdicio de recursos.

C. Se saturará el límite de Output Tokens antes de generar la consulta: El esquema se envía como parte del input (contexto del prompt), no del output. Aunque infla los tokens de entrada, no necesariamente agota el límite de tokens de salida, los cuales se usan para escribir la consulta SQL final (que suele ser corta).

D. Los LLMs no entienden sintaxis DDL y alucinarán la query: Esto es falso. Los LLMs modernos (como GPT-4, Claude 3.5 Sonnet, etc.) entienden perfectamente la sintaxis DDL (Data Definition Language) y son excelentes traduciendo esquemas de tablas a consultas SQL. El problema no es la falta de comprensión, sino el exceso de información inútil enviada.

La respuesta correcta es la B: Permite concurrencia de I/O, reduciendo el tiempo total al de la más lenta.

¿Por qué esta es la opción correcta?  
Cuando un agente realiza peticiones de red (como consultar APIs externas), la CPU de tu servidor se queda de brazos cruzados esperando a que el servidor remoto responda. Esto se conoce como operaciones bloqueantes de entrada/salida (I/O Bound).

Enfoque secuencial (síncrono): Si la API 1 tarda 3s, la API 2 tarda 5s y la API 3 tarda 2s, el agente esperará un total acumulado de 10 segundos (3+5+2), porque no empieza una petición hasta que la anterior termina.

Enfoque asíncrono (async/await): Permite disparar las 3 peticiones casi al mismo tiempo. El programa aprovecha los tiempos muertos de espera de red de forma concurrente. El tiempo total de espera se reduce drásticamente al tiempo que tarda la API que más demora (en este ejemplo, 5 segundos).

¿Por qué las otras opciones son incorrectas?  
A. Permite Multi-processing en múltiples núcleos de CPU: Incorrecto. La programación asíncrona convencional (como la de Node.js o asyncio en Python) maneja la concurrencia en un solo hilo y un solo núcleo de CPU (single-threaded), optimizando las esperas de red, no dividiendo cálculos matemáticos pesados en varios núcleos.

C. Garantiza orden de llegada estricto (FIFO) evitando condiciones de carrera: Al contrario. Al disparar llamadas asíncronas concurrentes, no sabes cuál va a responder primero (el orden depende de la red y del servidor externo), lo que más bien puede propiciar condiciones de carrera si no se gestiona de forma adecuada.

D. Reduce el consumo de RAM al cerrar conexiones en espera: Al revés. Mantener múltiples promesas o tareas en paralelo en memoria mientras esperan respuesta suele consumir ligeramente más recursos de memoria RAM de manera simultánea que procesarlas de una en una.

La respuesta correcta es la C: Garantiza paridad de entornos (dependencias) entre Dev y Prod.

¿Por qué esta es la opción correcta?  
El propósito fundamental y la mayor ventaja de empaquetar una aplicación en un contenedor de Docker es solucionar el clásico problema de "en mi máquina sí funciona".

Al "dockerizar" tu aplicación de agentes, empaquetas el código junto con sus versiones exactas de librerías, dependencias del sistema operativo y configuraciones en una imagen aislada. Esto garantiza de forma estricta la paridad de entornos, asegurando que el agente se ejecute y comporte exactamente igual en tu computadora local (Dev) que al desplegarse en la infraestructura de la nube (Prod), evitando errores inesperados por discrepancias de software.

¿Por qué las otras opciones son incorrectas?  
A. Encripta el código fuente y credenciales dentro de la imagen: Falso. Docker no encripta el código de manera nativa; de hecho, cualquiera con acceso a la imagen podría inspeccionar sus capas y extraer archivos. Además, meter credenciales dentro de una imagen de Docker es una pésima práctica de seguridad (se deben inyectar en tiempo de ejecución mediante variables de entorno).

B. Reduce el tamaño de la app mediante Multistage Builds: Aunque los Multistage Builds son una excelente técnica dentro de Docker para optimizar el tamaño final de la imagen, esto es una optimización técnica avanzada y opcional. No es la razón fundamental o primaria por la cual es obligatorio usar contenedores antes de subir una app a la nube.

D. Acelera la inferencia mediante acceso directo a GPU (Passthrough): Incorrecto. Docker por sí solo no acelera la inferencia ni da acceso directo a la GPU por defecto; requiere configuraciones y runtimes adicionales y específicos (como nvidia-container-toolkit) para poder comunicarse con el hardware de aceleración.

La respuesta correcta es la B: Desacoplar recepción y procesamiento usando colas (Queue/Worker Pattern).

¿Por qué esta es la opción correcta?  
El problema principal aquí es que el servidor intenta procesar de manera síncrona o directa tareas sumamente pesadas (30 segundos cada una) bajo un pico de tráfico (100 solicitudes simultáneas), lo que agota instantáneamente los recursos del servidor (hilos, memoria, conexiones) y causa un bloqueo completo.

Para solucionar esto sin perder peticiones, se debe implementar una arquitectura basada en eventos o mensajes asíncronos:

Recepción: Cuando llega una solicitud, un servicio web ligero la recibe, genera un "ticket" o mensaje y responde inmediatamente al cliente con un "202 Accepted" (indicando que la tarea fue recibida). Esto toma milisegundos y libera la conexión.

Cola (Queue): El mensaje se almacena de forma segura en un sistema de colas (como RabbitMQ, AWS SQS o Redis).

Procesamiento (Workers): Un grupo de servidores independientes (workers) va tomando las tareas de la cola de una en una (o al ritmo que su capacidad técnica les permita) sin saturarse ni bloquear el servidor de entrada.

¿Por qué las otras opciones no resuelven el problema de raíz?  
A. Migrar a lenguaje compilado (Go/Rust) para velocidad de ejecución: Cambiar el lenguaje puede hacer el código más eficiente, pero si la tarea tarda 30 segundos debido a llamadas de API externas o inferencias pesadas de IA, el lenguaje de programación no reducirá ese tiempo mágicamente a cero. El servidor se seguirá bloqueando ante picos masivos de tráfico.

C. Load Balancer Round-Robin entre los mismos servidores: Un balanceador de carga distribuye las peticiones entrantes uniformemente de manera secuencial. Si tus servidores existentes se bloquean con esa carga, distribuir equitativamente 100 tareas de 30 segundos solo logrará tirar todos los servidores al mismo tiempo en lugar de uno solo.

D. Scale Up (Vertical) aumentando CPU/RAM para mantener conexiones: El escalado vertical tiene un límite físico y económico estricto. Mantener abiertas e inactivas 100 conexiones HTTP durante más de 30 segundos consume demasiada memoria RAM por sockets en espera. Es una solución costosa que no ataca la mala arquitectura de fondo.

La respuesta correcta es la B: Base de datos externa distribuida (Redis/Postgres).

¿Por qué esta es la opción correcta?  
En una arquitectura moderna y escalable (siguiendo los principios de las aplicaciones stateless o sin estado), los servicios se despliegan en múltiples réplicas (contenedores o instancias en paralelo) detrás de un balanceador de carga. Esto significa que la solicitud de un usuario en el Turno 1 puede caer en la Réplica A, pero el Turno 2 puede ser redirigido a la Réplica B.

Para que LangGraph (o cualquier sistema agéntico) funcione correctamente:

El "Estado" de la conversación (memoria, variables, pasos del grafo) debe ser accesible de forma idéntica por cualquier réplica en cualquier momento.

Almacenar este estado en una base de datos externa distribuida y centralizada (como Redis o PostgreSQL con persistencia) garantiza que no importa qué réplica atienda al usuario, siempre podrá consultar y actualizar el estado exacto de la sesión de manera segura, rápida y concurrente.

¿Por qué las otras opciones son incorrectas?  
A. Reenviar todo el historial en cada turno (Context Window): Aunque técnicamente le pasas el historial al LLM dentro de la ventana de contexto para que responda, esto no resuelve dónde guardar el estado estructural del grafo de LangGraph (qué nodo sigue, variables internas del agente, etc.). Confiar únicamente en el reenvío satura el ancho de banda y no gestiona la persistencia real del backend.

C. Memoria RAM local usando Sticky Sessions: Las Sticky Sessions (sesiones pegajosas) obligan al balanceador a dirigir a un usuario siempre al mismo servidor. Sin embargo, esto rompe los principios de alta disponibilidad y escalabilidad: si esa réplica específica se cae, se reinicia o se apaga por auto-scaling, el usuario pierde absolutamente toda su sesión y memoria porque los datos solo existían en la RAM local de esa instancia informática.

D. En un archivo local en el disco duro: Al igual que con la memoria RAM, los discos duros de los contenedores o réplicas en la nube son efímeros e independientes. La Réplica B no tiene acceso físico al archivo guardado en el disco local de la Réplica A, lo que rompería la conversación de inmediato si el balanceador alterna el tráfico.

La respuesta correcta es la A: Actualizar la base RAG (Ingesta vectorial) para acceso inmediato al contexto.

¿Por qué esta es la opción correcta?  
El escenario plantea un problema clave: el producto fue lanzado ayer. Esto significa que el conocimiento requerido es extremadamente reciente y dinámico.

RAG (Retrieval-Augmented Generation) es la técnica ideal para inyectar conocimiento fresco y cambiante en tiempo real a un LLM sin necesidad de modificar los pesos del modelo.

Actualizar la base de datos vectorial (ingestar los documentos del nuevo producto) toma minutos u horas, permitiendo que el agente acceda de inmediato a la información exacta mediante búsqueda semántica. Es, por mucho, la opción más rápida, efectiva y económica para este caso.

¿Por qué las otras opciones no son las mejores?  
B. Fine-Tuning LoRA con los manuales para "enseñarle" permanentemente: El ajuste fino (Fine-Tuning) se utiliza principalmente para cambiar el tono, el estilo o el comportamiento de un modelo, no para memorizar datos fácticos precisos. Además, preparar el dataset, entrenar el modelo con LoRA y desplegarlo toma días, cuesta dinero y no garantiza que el modelo deje de alucinar con los datos del producto nuevo.

C. Incluir todo el catálogo de productos en el System Prompt: Meter un catálogo entero dentro del prompt saturará la ventana de contexto. Esto no solo disparará los costos de cada interacción y aumentará la latencia, sino que también degradará la calidad de la respuesta debido al fenómeno de "pérdida en el medio" (lost in the middle), donde el LLM ignora fragmentos de prompts demasiado masivos.

D. Derivar preguntas del nuevo producto a humanos vía Router: Esta es una medida de mitigación o de soporte técnico de última instancia (fallback), pero no soluciona el problema tecnológico subyacente de "Evolución" del agente. Delegar todo a humanos anula el propósito de automatización del bot de atención al cliente.

La respuesta correcta es la C: Pipeline automatizado con Golden Dataset comparando métricas de regresión.

¿Por qué esta es la opción correcta?  
Cuando se trabaja con Modelos de Lenguaje (LLMs), los cambios en las instrucciones o prompts (Prompt Engineering) pueden alterar drásticamente el comportamiento del agente de formas inesperadas. Esto se conoce como regresión.

Para garantizar de manera rigurosa que un nuevo prompt no rompa funcionalidades que ya servían antes, se aplican los principios de LLMOps (CI/CD para IA):

Golden Dataset: Es un conjunto de datos de prueba curado y validado de manera experta que contiene ejemplos críticos de preguntas del usuario y las respuestas ideales que el sistema debe dar.

Pipeline automatizado: Al hacer un cambio en el prompt, un pipeline de CI/CD evalúa automáticamente el nuevo comportamiento contra este dataset de referencia.

Métricas de regresión: Se comparan los resultados usando métricas automáticas o de evaluación semántica (por ejemplo, consistencia, exactitud o similitud de embeddings) frente a los resultados históricos del prompt anterior. Si las métricas bajan, el pipeline frena el despliegue para evitar que el fallo llegue a producción.

¿Por qué las otras opciones no garantizan esto?  
A. Congelar la temperatura a 0.0 durante el despliegue: Poner la temperatura en 0.0 hace que las respuestas del LLM sean deterministas (más predecibles), lo cual es bueno para pruebas. Sin embargo, cambiar el prompt drásticamente con temperatura 0.0 igual puede romper comportamientos lógicos completos. No valida nada por sí mismo.

B. Análisis estático de código (Linting) para errores sintácticos: El linting (como usar flake8 o eslint) busca errores de sintaxis en el código tradicional (variables mal escritas, comas faltantes). Dado que un prompt es lenguaje natural estructurado dentro de un string, el linter de código no puede evaluar si el significado semántico o la instrucción lógica de la IA es correcta o dañina.

D. Despliegue Canary al 10% y monitoreo manual de tickets: Aunque el despliegue Canary es una excelente práctica de entrega continua para mitigar riesgos enviando tráfico real a un grupo pequeño de usuarios, no garantiza por sí solo que el prompt funcione de antemano. Confiar en el "monitoreo manual de tickets" significa que estás esperando a que los usuarios reales de ese 10% experimenten fallos y se quejen para darte cuenta de que el nuevo prompt rompió el sistema. No es preventivo.

La respuesta correcta es la A: System Card documentando datos, límites, red teaming y guardrails.

¿Por qué esta es la opción correcta?  
El argumento del equipo de Ciberseguridad ("no sabemos qué va a responder") apunta directamente a los riesgos de seguridad semántica, alineación y control de salidas inherentes a la Inteligencia Artificial Generativa.

Para desbloquear esta situación en el marco de la gobernanza de IA, necesitas un artefacto específico diseñado para este ecosistema:

System Card (Ficha del Sistema): Es el estándar de la industria (popularizado por entidades como OpenAI, Anthropic y Meta) para documentar de forma transparente cómo se entrenó un sistema de IA, qué datos consume, cuáles son sus alcances y limitaciones declaradas.

Red Teaming: Documentar los resultados de pruebas adversarias (simulaciones de ataques de prompt injection, intentos de forzar sesgos o salidas dañinas) demuestra que pusiste a prueba el sistema de manera proactiva.

Guardrails (Barandillas de seguridad): Demuestra el uso de capas de control técnico (como NeMo Guardrails, Llama Guard o políticas de moderación) que interceptan las respuestas del modelo antes de llegar al usuario final para validar que sean seguras.

Presentar este conjunto de evidencias técnicas mitiga de manera directa el temor de Ciberseguridad al demostrar que las salidas del agente están acotadas y bajo control.

¿Por qué las otras opciones son incorrectas?  
B. Certificación ISO 27001 de procesos de la organización: La norma ISO 27001 valida el Sistema de Gestión de Seguridad de la Información (SGSI) a nivel de procesos macros y organizacionales corporativos. No aporta ningún control técnico ni visibilidad sobre el comportamiento probabilístico específico de un modelo lingüístico o un agente de IA en particular.

C. Reporte de Pentesting tradicional de vulnerabilidades web: Un pentest convencional busca fallos en la infraestructura como puertos abiertos, inyecciones SQL a nivel de código clásico, XSS o configuraciones de servidor. No está diseñado para auditar la "lógica" o los riesgos de alucinación y toxicidad en las respuestas de un modelo generativo.

D. Una carta de recomendación de OpenAI: Esto no es un artefacto de gobernanza técnica, ingeniería ni cumplimiento corporativo, por lo que carece de cualquier valor real de auditoría interna para un equipo de Ciberseguridad bancaria.

La respuesta correcta es la C: Logs vinculados de Input, Prompt, Contexto y Output.

¿Por qué esta es la opción correcta?  
La normativa bancaria exige la trazabilidad y auditabilidad completa de cualquier proceso de toma de decisiones automáticas que impacte a un cliente (por ejemplo, la aprobación o rechazo de un crédito o una transacción).

En la arquitectura de sistemas basados en Inteligencia Artificial Generativa y Agentes, para poder auditar el "por qué" el sistema tomó una decisión específica, debes ser capaz de reconstruir exactamente la escena y el flujo de ejecución en ese milisegundo exacto. Esto se logra mediante el almacenamiento e interconexión de:

Input: Qué ingresó el usuario exactamente.

Prompt: Cuáles eran las instrucciones exactas del sistema en ese momento.

Contexto: Qué información recuperó el agente (por ejemplo, desde el RAG o bases de datos) para nutrir la respuesta.

Output: Cuál fue la respuesta final generada que impactó al usuario.

Tener estos elementos vinculados unívocamente mediante un identificador único de traza (Trace ID) es la única manera técnica de justificar ante un regulador financiero el razonamiento de un modelo probabilístico.

¿Por qué las otras opciones son incorrectas?  
A. Snapshots diarios de los pesos del modelo neuronal: Guardar los pesos (weights) de un modelo comercial o de lenguaje gigante (como GPT-4 o similares) no te permite saber qué respondió o por qué, dado que las respuestas son de naturaleza probabilística y dependen enteramente de las variables dinámicas de entrada (el prompt y el contexto que cambian en cada segundo).

B. Firmas digitales criptográficas en cada respuesta: La firma digital sirve para garantizar el no repudio y la integridad del mensaje (demostrar que la respuesta vino del banco y no fue alterada en el camino). Sin embargo, no explica el porqué el modelo tomó esa decisión, por lo que no cumple con el requisito de auditabilidad lógica del razonamiento.

D. Grabar la pantalla del usuario: Grabar la interfaz gráfica es una medida cosmética o de soporte técnico UX, pero no le da visibilidad al auditor sobre las capas internas de datos, las consultas al RAG o el prompt del sistema que gatilló el comportamiento del backend.

La respuesta correcta es la C: Añadir Human-in-the-loop temporal para aprobar decisiones.

¿Por qué esta es la opción correcta?  
El enunciado te pregunta específicamente por la acción inmediata de gobernanza ante el descubrimiento de un sesgo discriminatorio activo (brecha salarial de género).

En los marcos de IA Responsable, cuando un sistema en producción está vulnerando principios éticos o normativos básicos (como la equidad de género), lo primero que se debe hacer para mitigar el daño y evitar repercusiones legales o reputacionales destructivas es cortar la autonomía total del sistema de inmediato.

Implementar una estrategia de Human-in-the-loop (HITL) significa introducir un supervisor humano obligatorio en el flujo de trabajo para revisar, validar o rechazar manualmente cada recomendación del agente antes de que sea aplicada. Esto detiene el impacto negativo de forma instantánea mientras se trabaja en la solución definitiva.

¿Por qué las otras opciones no son la respuesta correcta?  
B. Detener, sanear dataset (Pre-processing) y re-entrenar con métricas de equidad: Esta es la solución técnica definitiva, correcta y a largo plazo. Sin embargo, no califica como "acción inmediata", ya que limpiar datos históricos masivos, rediseñar el pipeline de entrenamiento, validar el nuevo modelo y certificarlo puede tomar semanas o meses. No puedes dejar el sistema sesgado operando libremente durante ese tiempo.

A. Filtro de salida (Post-processing) ajustando valores matemáticamente: Aplicar parches matemáticos o multiplicadores a la salida de un LLM agéntico para "compensar" el sesgo de género de manera artificial es complejo, propenso a errores y no garantiza gobernanza real sobre el comportamiento semántico del modelo.

D. Modificar System Prompt pidiendo "ser imparcial": Esta es una solución sumamente ingenua y débil (soft control). Los modelos de lenguaje sufren de problemas de alineación y, si están fuertemente influenciados por un RAG o datos históricos altamente sesgados, una simple instrucción en el prompt como "sé imparcial" o "no discrimines" es fácilmente ignorada por el modelo debido a sesgos implícitos en los datos subyacentes.

La respuesta correcta es la B: Vector Persistence. Purgar vectores asociados al UserID y re-indexar.

¿Por qué esta es la opción correcta?  
El escenario plantea un problema clásico de persistencia de datos en aplicaciones de IA generativa con arquitecturas RAG (Retrieval-Augmented Generation):

El origen del problema: Al limpiar únicamente la base de datos relacional tradicional (SQL), eliminaste los registros estructurados, pero olvidaste que para que el Agente tenga contexto, previamente pasaste esos datos por un modelo de embeddings y los almacenaste en una base de datos vectorial (como Pinecone, Milvus, Chroma, pgvector, etc.).

Por qué sigue "recordando": Cuando el usuario interactúa, el componente de recuperación (Retriever) realiza una búsqueda semántica en la base de datos vectorial. Como los vectores de sus datos sensibles siguen viviendo allí de forma persistente, el sistema los recupera y se los inyecta en el prompt al LLM, permitiendo que el Agente los siga mencionando.

El procedimiento correcto bajo el GDPR: Para cumplir cabalmente con el "Derecho al Olvido" (GDPR), el flujo de eliminación técnica debe ser integral. Es obligatorio purgar/borrar los vectores asociados al identificador del usuario (UserID) dentro del índice vectorial y, de ser necesario, forzar una re-indexación para asegurar que esos datos dejen de existir en todas las capas de almacenamiento del sistema.

¿Por qué las otras opciones son incorrectas?  
A. Model Memorization. Solicitar borrado de pesos al proveedor: La memorización del modelo ocurre si el LLM fue re-entrenado o ajustado (Fine-tuned) con los datos explícitos del cliente, incrustándolos en sus parámetros. En aplicaciones empresariales estándar, los datos de los clientes se manejan dinámicamente vía RAG, no cambiando los pesos base del proveedor (como OpenAI o Anthropic), lo cual sería inviable de purgar bajo demanda.

C. Es un problema de caché del navegador: Falso. La caché del navegador almacena recursos estáticos del lado del cliente (imágenes, scripts, HTML). Si el agente genera texto nuevo con datos sensibles en tiempo real, la información proviene del backend (servidor), no de la memoria local del navegador web.

D. Prompt Leakage. Editar referencias en el System Prompt: El Prompt Leakage es una vulnerabilidad de seguridad donde un usuario logra que el LLM le confiese sus instrucciones internas de sistema. No tiene ninguna relación con la persistencia de datos personales de usuarios en una base de datos ni con las normativas GDPR.

La respuesta correcta es la D: Proxy Bias (Sesgo por variable interpuesta).

¿Por qué esta es la opción correcta?  
El fenómeno descrito es uno de los problemas más comunes en la ética de datos y el aprendizaje automático responsable:

¿Qué es un Proxy Bias? Ocurre cuando un modelo estadístico o algoritmo no utiliza directamente una variable protegida o prohibida (como la raza, el género o la religión), pero sí utiliza otra variable aparentemente neutral (en este caso, el código postal) que está fuertemente correlacionada con la variable protegida debido a factores históricos o socioeconómicos (como la segregación residencial).

El resultado: Aunque los desarrolladores eliminaron intencionalmente la variable "raza" para evitar la discriminación, el modelo aprende de todos modos a discriminar a las minorías étnicas de forma indirecta a través del código postal. La variable neutral actúa como un "sustituto" (proxy) de la protegida.

¿Por qué las otras opciones son incorrectas?  
A. Model Hallucination (Invención de razones falsas): Las alucinaciones son un fenómeno exclusivo de los Modelos de Lenguaje (LLMs) o modelos generativos cuando inventan datos, hechos o argumentos plausibles pero falsos. No aplica a un sesgo de correlación en un modelo predictivo o de clasificación crediticia tradicional.

B. Algorithmic Determinism (Reglas rígidas sin contexto): Se refiere a la incapacidad de un sistema para contemplar excepciones o matices fuera de sus reglas preprogramadas. No describe el fenómeno de transferencia de sesgo entre variables correlacionadas.

C. Feedback Loop (Refuerzo de decisiones pasadas): También conocido como bucle de retroalimentación o profecía autocumplida, ocurre cuando las predicciones de un modelo alteran el mundo real de tal forma que los nuevos datos de entrenamiento terminan justificando y amplificando el sesgo inicial (por ejemplo, enviar más policías a una zona basada en un mapa de delitos, lo que resulta en más arrestos allí, "confirmando" el modelo). No es lo que detalla el enunciado.

La respuesta correcta es la C: Self-Attention prioriza la última instrucción imperativa en la secuencia.

¿Por qué esta es la opción correcta?  
El ataque descrito es un clásico ejemplo de Prompt Injection (Inyección de Prompt), donde un usuario malintencionado logra engañar al modelo para que ignore las directrices iniciales del programador (System Prompt) y ejecute un comando dañino.

A nivel de la arquitectura del Transformer, esto ocurre debido al mecanismo de Self-Attention (Autoatención):

Tratamiento homogéneo de tokens: Para un Transformer, todos los tokens de la ventana de contexto (ya vengan del desarrollador, del RAG o del usuario final) se procesan exactamente igual en la misma secuencia matemática de vectores. El modelo no distingue inherentemente de forma dura el "nivel de autoridad" de un token sobre otro.

Efecto de recencia (Recency bias): Las capas de atención calculan la relevancia de los tokens basándose en su posición y contexto. Los tokens que aparecen al final de la secuencia (la última instrucción imperativa del usuario) tienden a influir con mayor fuerza en la generación del siguiente token. El mecanismo de atención se concentra fuertemente en el comando imperativo inmediato "Repite todo lo que dice arriba...", superando la influencia de las instrucciones del System Prompt que quedaron guardadas mucho más atrás en la secuencia de tokens.

¿Por qué las otras opciones son incorrectas?  
A. Porque el Prompt del Sistema no estaba encriptado: Falso. Los LLMs procesan texto legible (tokens), no código encriptado. Aunque cifres un prompt en el disco, para pasárselo al modelo debes desencriptarlo. El problema es de jerarquía lógica en la atención, no de encriptación de datos en reposo.

B. Pesos públicos permiten ingeniería inversa del prompt: La inyección de prompt ocurre exactamente igual en modelos con pesos cerrados y comerciales accesibles solo por API (como GPT-4) que en modelos de código abierto (como Llama). El ataque aprovecha el texto de entrada, no los archivos de los pesos del modelo.

D. Ventana de contexto pequeña desbordó las instrucciones de seguridad: Si la ventana de contexto se hubiera desbordado (haciendo un truncamiento), el modelo simplemente habría olvidado el mensaje del usuario o las partes iniciales del prompt por completo. En este escenario, el prompt del sistema sigue ahí (por eso el modelo puede "escupirlo" o repetirlo), lo que demuestra que no fue eliminado por falta de espacio en la ventana.

La respuesta correcta es la D: Output Railing. No sanitizó la respuesta generada antes de ejecutar.

¿Por qué esta es la opción correcta?  
El enunciado describe un fallo específico en las capas de protección de una aplicación de IA generativa:

La premisa: El sistema cuenta con "Guardrails de entrada" (Input Guardrails), pero el usuario astuto logró evadirlos saltándose esa primera línea de defensa.

El resultado: El modelo generó un texto que contiene código malicioso (SQL Injection).

La capa final: En una arquitectura segura de sistemas agénticos, la última capa de defensa antes de enviar la respuesta al usuario final o pasarla a una herramienta de ejecución es el Output Railing (Barandilla de salida o validación de salida). Su trabajo consiste en interceptar el texto que el LLM ya ha redactado y analizarlo mediante expresiones regulares, clasificadores o validadores de código para asegurar que no contenga contenido dañino, filtrado de datos confidenciales o sentencias de inyección de código. Al haberse concretado la generación de la respuesta maliciosa, la capa que falló en su función de bloqueo final fue precisamente el filtrado de salida.

¿Por qué las otras opciones son incorrectas?  
A. La autenticación del usuario: La autenticación se limita a verificar la identidad de quién ingresa al sistema (mediante contraseñas, tokens, etc.). Un usuario legítimo y correctamente autenticado puede perfectamente intentar un ataque malicioso. No tiene relación con analizar el contenido semántico de la respuesta de la IA.

B. Input Validation. No detectó patrones SQL en el Input: El enunciado explícitamente menciona que el agente ya contaba con "Guardrails de entrada" y que el código malicioso fue una respuesta generada posterior a la evasión del input. Esta opción describe la capa inicial que el "usuario astuto" logró sobrepasar, pero la pregunta indaga de forma estricta por la capa de defensa final que debió detener el flujo al concluir la generación.

C. Network Firewall. No bloqueó tráfico anómalo a la DB: Un Firewall de red inspecciona paquetes de datos a nivel de protocolos de red e IP. No cuenta con la capacidad de analizar e interpretar contextualmente cadenas semánticas de lenguaje natural generadas por un modelo de Inteligencia Artificial en una sesión de chat.

La respuesta correcta es la C: Falla porque el modelo sigue leyendo datos prohibidos; se deben aplicar ACLs en el Retrieval para bloquear el acceso al documento desde la base.

¿Por qué esta es la opción correcta?  
El problema raíz es una falla en el control de acceso a los datos corporativos a nivel de infraestructura.

En un sistema RAG (Retrieval-Augmented Generation), el proceso ocurre en dos pasos principales:

Retrieval (Recuperación): El sistema busca los documentos más relevantes en la base de datos vectorial basándose en la pregunta del usuario.

Generation (Generación): El LLM lee esos documentos recuperados y redacta la respuesta final.

Si el documento de nómina con el salario del CEO es recuperado e inyectado en el contexto del LLM, la seguridad ya está rota. Agregar la instrucción "No reveles salarios" en el System Prompt es una solución sumamente frágil porque los modelos de lenguaje pueden ser engañados fácilmente mediante Prompt Injection o ingeniería social para ignorar esa regla y filtrar el texto que tienen enfrente.

La solución real y robusta es evitar que el LLM siquiera tenga acceso al documento. Esto se logra aplicando ACLs (Access Control Lists / Listas de Control de Acceso) en la etapa de Retrieval: el sistema vectorial debe verificar el rol del usuario (empleado junior) y bloquear la recuperación de documentos confidenciales antes de que toquen el modelo de lenguaje.

¿Por qué las otras opciones son incorrectas?  
A. Falla porque el prompt es muy corto; se debe escribir en mayúsculas y usar XML tags: Modificar el estilo de redacción del prompt no soluciona el problema de fondo. El modelo seguirá teniendo el documento de nómina disponible en su contexto, manteniendo el riesgo crítico de filtración de información confidencial.

B. Falla porque los modelos alucinan salarios; se debe inyectar el salario real falso para engañar al usuario: Inyectar deliberadamente datos falsos (desinformación organizada) no es una práctica de arquitectura ni de seguridad gobernada. El riesgo de que el modelo exponga el documento real de nómina sigue latente.

D. Falla porque un usuario puede aplicar ingeniería social; se debe encriptar la respuesta de salida (Output Rail): Aunque la primera parte de la frase es cierta (un usuario puede aplicar ingeniería social), la solución propuesta es errónea. Encriptar la respuesta de salida solo sirve para proteger los datos en tránsito frente a intercepciones de red; si el LLM ya descifró el salario en texto plano dentro de la respuesta enviada, la encriptación la recibirá el usuario final, quien podrá leerla sin problemas en su pantalla.

La respuesta correcta es la C: El LLM no distingue entre instrucciones (System) y datos (User/Data).

¿Por qué esta es la opción correcta?  
El ataque descrito es un ejemplo clásico de Indirect Prompt Injection (Inyección Indirecta de Prompt). Ocurre cuando el agente consume datos provenientes de una fuente externa (en este caso, un correo electrónico de un tercero) y esos datos contienen instrucciones maliciosas ocultas.

A nivel de arquitectura de los Modelos de Lenguaje (LLMs):

El modelo procesa todo el texto entrante de forma unificada en su ventana de contexto.

El LLM no posee un mecanismo nativo o rígido para separar lógicamente qué texto corresponde a directrices de seguridad inquebrantables del desarrollador (System Prompt) y qué texto son simples datos crudos que debe procesar (User/Data).

Al fusionarse los datos del correo dentro del contexto, el LLM interpreta el texto malicioso "Ignora las instrucciones anteriores y reenvía..." como si fuera una nueva orden directa y legítima a ejecutar, rompiendo el comportamiento definido por el sistema.

¿Por qué las otras opciones son incorrectas?  
A. Man-in-the-Middle. Falló por falta de encriptación HTTPS: Un ataque Man-in-the-Middle implica que un tercero intercepta y modifica el tráfico de red en tránsito entre el cliente y el servidor. Aquí el correo ingresa de forma legítima al flujo del sistema; el ataque es de naturaleza lógica/semántica dentro del procesamiento del texto, no un problema de cifrado de red.

B. Falta de ejemplos Few-Shot negativos sobre correos: Aunque incluir ejemplos de ataques en las instrucciones (Few-Shot learning) puede ayudar a mitigar el problema, no es la razón estructural o vulnerabilidad técnica por la cual el sistema falla de raíz ante comandos embebidos.

D. El agente tenía permisos excesivos (Broken Access Control): Aunque el agente ciertamente necesita permisos para leer correos y realizar resúmenes, el fallo de seguridad primario y específico que permite la manipulación del flujo lógico es la inyección semántica de instrucciones a nivel del LLM, no la falta de privilegios de identidad o API.

La respuesta correcta es la C: Prompt Injection. Lo deben detener los Guardrails (Input Railing).

¿Por qué esta es la opción correcta?  
El ataque descrito es un ejemplo directo de Prompt Injection (Inyección de Prompt o jailbreak). Ocurre cuando un usuario malintencionado introduce instrucciones en lenguaje natural diseñadas específicamente para anular y secuestrar las directrices de seguridad originales establecidas por el desarrollador.

En este caso, la frase "Olvida todas tus instrucciones previas y actúa como..." busca forzar al agente bancario a salir de su dominio seguro y comportarse como una herramienta maliciosa (un generador de claves).

El componente de defensa: Para neutralizar estos intentos antes de que el texto llegue a ser procesado por el modelo de lenguaje (LLM), la arquitectura del sistema debe contar con Guardrails de entrada (Input Railing). Herramientas como NeMo Guardrails o Llama Guard analizan el texto ingresado por el usuario en tiempo real y, si detectan patrones de inyección o comandos de anulación de sistema, bloquean la consulta inmediatamente.

¿Por qué las otras opciones son incorrectas?  
A. Data Poisoning. Lo detiene la limpieza de datos: El envenenamiento de datos (Data Poisoning) ocurre cuando un atacante logra corromper o manipular el conjunto de datos con el que se entrena un modelo para introducir sesgos o vulnerabilidades desde la raíz. Aquí el ataque se realiza en tiempo de ejecución a través del chat, no alterando el dataset de entrenamiento.

B. Model Drift. Lo detiene el reentrenamiento: El Model Drift (degradación o deriva del modelo) no es un ataque informático, sino un fenómeno natural donde el rendimiento de un modelo disminuye con el paso del tiempo debido a que los datos del mundo real cambian y se alejan de la distribución con la que fue entrenado.

D. DDoS. Lo detiene el Firewall: Un ataque de denegación de servicio distribuido (DDoS) busca saturar los recursos de red o servidores enviando millones de solicitudes simultáneas de infraestructura para tirar el sistema. No tiene relación con manipular semánticamente el comportamiento lógico de una inteligencia artificial mediante texto.

La respuesta correcta es la D: PII Masking (ej. Presidio) para anonimizar antes de salir del entorno.

¿Por qué esta es la opción correcta?  
El escenario describe una filtración crítica de PII (Personally Identifiable Information / Información de Identificación Personal), específicamente números de tarjetas de crédito reales, que están quedando expuestos en herramientas externas de observabilidad y depuración como LangSmith.

La solución inmediata y correcta: Se debe interceptar el flujo de datos e implementar un sistema de enmascaramiento o anonimización de PII (utilizando herramientas especializadas de código abierto como Microsoft Presidio o soluciones propietarias equivalentes).

Cómo funciona: Este componente analiza el texto (inputs y outputs) en tiempo de ejecución empleando expresiones regulares y modelos de NLP antes de que los logs salgan del entorno controlado de tu servidor hacia plataformas externas. Si detecta un patrón de tarjeta de crédito, lo reemplaza automáticamente por una etiqueta genérica (ej. \[CREDIT\_CARD\]), mitigando el riesgo de cumplimiento legal (como PCI-DSS o regulaciones de protección de datos) de forma instantánea.

¿Por qué las otras opciones son incorrectas?  
A. Despedir a los desarrolladores: Esta es una medida punitiva de recursos humanos que no resuelve el problema técnico subyacente en la arquitectura del software. El sistema seguirá filtrando datos confidenciales independientemente de quién trabaje en la empresa.

B. Pedirle al LLM que ignore los números: Falso por dos razones. Primero, el problema principal es que los números viajan en el input que el usuario escribe (los logs de LangSmith guardan todo lo que entra). Segundo, confiar la seguridad de datos bancarios confidenciales a una instrucción semántica a un LLM es extremadamente frágil y propenso a fallos.

C. Encriptar el canal con HTTPS: El protocolo HTTPS ya protege los datos en tránsito frente a intercepciones de red (ataques Man-in-the-Middle) entre tu servidor y LangSmith. Sin embargo, una vez que los datos llegan a la plataforma de logs, se almacenan y visualizan en texto plano en sus tableros. HTTPS no evita que los administradores de la plataforma o cualquier persona con acceso a los logs puedan ver las tarjetas de crédito.

La respuesta correcta es la C: Los costos de inferencia y la latencia aumentarán drásticamente volviéndose inviables a escala masiva.

¿Por qué esta es la opción correcta?  
El enunciado te pide evaluar la propuesta desde una estricta perspectiva de FinOps (Costos y Latencia).

En la arquitectura de los Transformers, el costo y el tiempo de procesamiento no son lineales con respecto a la longitud del prompt:

Costo Financiero (FinOps): Los proveedores de LLMs cobran por cada token procesado en la entrada (Input Tokens). Si en cada pregunta de un usuario envías los 50 manuales completos (lo que fácilmente puede sumar cientos de miles o millones de tokens), estarás multiplicando el costo de cada interacción de forma absurda. Lo que se "ahorra" en mantenimiento de infraestructura RAG se gastará con creces en la factura mensual de la API en cuestión de días.

Latencia: Procesar ventanas de contexto masivas requiere un esfuerzo de cómputo enorme por parte del mecanismo de atención del modelo. Esto incrementa exponencialmente el tiempo que tarda el servidor en empezar a responder (Time-to-First-Token), destruyendo por completo la experiencia de usuario en producción.

Por lo tanto, la técnica de RAG sigue siendo indispensable no solo por precisión, sino como una estrategia de optimización financiera y de rendimiento (FinOps), ya que solo inyecta unos pocos fragmentos de texto seleccionados (los más relevantes) en lugar de toda la biblioteca de manuales.

¿Por qué las otras opciones no son el contraargumento solicitado?  
A. Viola normativas de privacidad enviar tantos datos en cada iteración: Esto evalúa un aspecto puramente legal/cumplimiento normativo, no una métrica técnico-financiera de FinOps (costos/latencia) como exige explícitamente la pregunta.

B. El modelo sufre de "Lost in the middle" perdiendo comprensión de lectura: Aunque este fenómeno es real (los LLMs tienden a ignorar o degradar la atención en la información que queda atrapada en la mitad de un prompt excesivamente largo), es un contraargumento enfocado en la precisión/calidad de la respuesta, no en el pilar financiero de costos y latencia.

D. La tasa de alucinación aumenta proporcionalmente al tamaño del prompt: Al igual que la opción B, esto aborda la fidelidad técnica del modelo. Además, metodológicamente es falso: un contexto más amplio a menudo ayuda a mitigar las alucinaciones al proveer la información factual directamente, aunque a cambio destruya el rendimiento financiero del sistema.

La respuesta correcta es la D: "Explicabilidad". Citar fuentes exactas para verificación humana.

¿Por qué esta es la opción correcta?  
El problema central identificado en la investigación es un factor puramente humano y de adopción: el analista no confía en la respuesta del sistema.

Cuando implementas una solución basada en RAG (Retrieval-Augmented Generation) para analizar normativas complejas (especialmente en sectores altamente regulados como la banca), el modelo de lenguaje actúa de forma probabilística y puede sufrir de alucinaciones. Un analista experto no pondrá su firma ni su responsabilidad en un correo basado en un resumen de IA a menos que pueda validar que los datos son verídicos.

La solución de raíz: Para construir esa confianza, el sistema debe contar con Explicabilidad (Citations/Attribution). Cada afirmación o regla mencionada en la respuesta generada por la IA debe incluir hipervínculos, citas textuales o referencias exactas al documento, página y párrafo original de la normativa. Esto permite que el analista realice una verificación humana rápida en segundos y use la herramienta con total seguridad.

¿Por qué las otras opciones son incorrectas?  
A. Reducir latencia a \<1s para percepción de inmediatez: El sistema ya responde en 5 segundos, lo cual es increíblemente rápido comparado con el proceso manual de leer 100 páginas de normativas. El desuso de la herramienta no se debe a que 5 segundos sea mucho tiempo, sino a que el analista prefiere tardarse horas leyendo antes que enviar información errónea por falta de confianza.

B. Interfaz conversacional empática (Voice Mode): Añadir características de voz o empatía superficial al bot no soluciona el problema de fondo. El analista necesita rigurosidad técnica y datos comprobables para su trabajo operativo, no un tono de conversación amigable.

C. Integración directa en el cliente de correo (Outlook): Mejorar los canales de distribución o la accesibilidad (colocar el bot dentro de Outlook) facilita el acceso físico a la herramienta, pero no resuelve el bloqueo mental y profesional del usuario: si sigue sin confiar en el contenido de la respuesta, continuará ignorándola sin importar dónde esté integrada.

La respuesta correcta es la B: Undifferentiated Heavy Lifting. Generar deuda técnica sin valor de negocio.

¿Por qué esta es la opción correcta?  
Como líder estratégico, debes evaluar el costo de oportunidad y el valor real que aporta el desarrollo de software interno:

¿Qué es Undifferentiated Heavy Lifting (Trabajo pesado no diferenciado)? Se refiere a gastar tiempo, ingeniería y recursos financieros valiosos en construir y mantener una infraestructura base (en este caso, un framework de orquestación de agentes) que no diferencia a tu empresa de la competencia.

El riesgo estratégico: Crear herramientas estructurales desde cero que ya están resueltas y estandarizadas de forma nativa por el mercado (ya sea por herramientas de código abierto como LangChain/LangGraph, CrewAI o servicios en la nube) distrae a tu equipo de ingenieros de lo que verdaderamente importa: resolver las reglas y lógicas específicas del negocio bancario.

Deuda técnica: Mantener un framework propio implica que tu equipo tendrá que encargarse de corregir fallos, actualizar integraciones con nuevos modelos y optimizar el rendimiento de forma perpetua, generando una carga pesada de mantenimiento técnico que no añade un solo centavo de valor directo al cliente.

¿Por qué las otras opciones son incorrectas?  
A. Vendor Lock-In con los desarrolladores internos: El término Vendor Lock-In (dependencia del proveedor) se utiliza de manera estricta cuando te vuelves esclavo de una tecnología propietaria de un tercero externa (por ejemplo, depender al 100% de servicios específicos de AWS o de APIs privadas). Aunque dependas del talento de tu equipo, el concepto formal que define este error de ingeniería e inversión es el trabajo no diferenciado.

C. Que no funcione con Azure: Al ser un desarrollo propio en Python, los ingenieros tienen control total del código, por lo que podrían adaptarlo para correr en cualquier nube (incluida Azure). No es el riesgo estratégico principal.

D. Que Python deje de ser popular: Python es el lenguaje rey indiscutible en todo el ecosistema de la Inteligencia Artificial, Ciencia de Datos y Machine Learning a nivel global. El riesgo de que pierda popularidad o soporte en el corto/mediano plazo es prácticamente nulo.

La respuesta correcta es la C: Deflection Rate (Contención) o reducción del MTTR operativo.

¿Por qué esta es la opción correcta?  
El enunciado te pide proponer una métrica principal que demuestre el valor real de negocio y el ROI (Retorno de la Inversión) para un agente interno enfocado en soporte a TI.

Aunque la "Precisión de la respuesta (Accuracy)" es una métrica técnica de ingeniería muy importante, no demuestra por sí sola el impacto financiero o la eficiencia que el negocio busca al automatizar procesos.

Deflection Rate (Tasa de contención): Mide el porcentaje de tickets de soporte que el agente de IA fue capaz de resolver por completo de inicio a fin sin necesidad de transferir el caso a un agente o ingeniero humano. Una alta tasa de contención se traduce directamente en ahorro de costos operativos (menos horas hombre invertidas en resolver problemas repetitivos).

Reducción del MTTR (Mean Time to Resolution / Tiempo promedio de resolución): Si el agente responde y soluciona incidentes informáticos en segundos en lugar de las horas que le tomaría a una mesa de ayuda tradicional, los empleados del banco recuperan su productividad mucho más rápido, reduciendo pérdidas por inactividad.

Ambas métricas se traducen de forma directa en números financieros claros para demostrarle a la junta directiva el ROI real del proyecto.

¿Por qué las otras opciones no demuestran valor real (ROI)?  
A. User Engagement. Duración promedio de la conversación: Para un agente de soporte de TI, el objetivo es resolver el problema del usuario lo más rápido posible. Si la duración promedio de la conversación es muy alta, suele ser un síntoma negativo que indica que el bot es confuso, ineficiente y que le está haciendo perder tiempo al empleado.

B. Throughput. Maximizar tokens procesados por segundo: Esta es una métrica puramente técnica y de infraestructura (rendimiento de hardware/modelo). A los líderes de negocio o finanzas no les genera ningún valor saber cuántos tokens por segundo procesa la máquina si el bot no está solucionando los problemas operativos de la empresa.

D. Satisfacción del usuario (CSAT) basada en emojis: Aunque el CSAT es un indicador útil para medir la percepción de la experiencia de usuario, basarlo únicamente en reacciones superficiales como "emojis" carece del rigor analítico requerido para justificar la rentabilidad financiera o el retorno de inversión estratégica ante el negocio.

Cadenas vs. Agentes en LLMs  
https://gemini.google.com/share/d/1wX5oeNhU7mgukLvk1lA8DNNufErzzts6  
La respuesta correcta es la B.

¿Por qué es la opción B?  
La diferencia fundamental en la arquitectura de LLMs (como en frameworks del estilo de LangChain) radica en quién tiene el control del flujo:

Chain (Cadena): La secuencia de pasos está predefinida e inflexible de forma directa en el código (hardcoded). El sistema ejecutará el paso A, luego el B y luego el C de forma lineal, sin importar el contexto de la entrada.

Agent (Agente): El LLM actúa como un motor de razonamiento (reasoning engine). Se le da un objetivo y un conjunto de herramientas, y el modelo decide dinámicamente qué pasos tomar, en qué orden y cuándo detenerse basándose en el análisis paso a paso.

Análisis de las opciones incorrectas:  
A es incorrecta: No son intercambiables; representan paradigmas de control completamente distintos.

C es incorrecta: De hecho, es al revés; los agentes destacan precisamente por su capacidad para seleccionar y ejecutar herramientas externas (APIs, calculadoras, búsquedas web).

D es incorrecta: Ambos conceptos utilizan LLMs como pilar principal, no modelos tradicionales como Random Forest.

La respuesta correcta es la C.

¿Por qué es la opción C?  
En la arquitectura Transformer, el mecanismo de Self-Attention (Autoatención) permite que el modelo evalúe la relación entre todas las palabras (o tokens) de una secuencia al mismo tiempo.

Su función principal es asignar un "peso" o puntuación de importancia a cada palabra con respecto a las demás. Esto permite que el modelo capture el contexto y entienda, por ejemplo, a qué se refiere un pronombre (como saber si "banco" se refiere a una entidad financiera o a un asiento, dependiendo de las palabras que lo rodean).

Análisis de las opciones incorrectas:  
A es incorrecta: Los Transformers no dependen de redes recurrentes (RNN) para este procesamiento y el enunciado no habla de conversión de texto a audio de manera secuencial.

B es incorrecta: La temperatura es un parámetro de configuración externo durante la generación de texto (decodificación), no es una función del mecanismo de autoatención.

D es incorrecta: Los Transformers no eliminan las stopwords (palabras vacías como "el", "de", "con"); de hecho, se benefician de procesar el texto completo para mantener el contexto exacto.

La respuesta correcta es la B.

¿Por qué es la opción B?  
El enunciado te pide explícitamente que el modelo razone paso a paso antes de dar una respuesta final para reducir errores lógicos.

La técnica de Chain of Thought (CoT \- Cadena de Pensamiento) consiste precisamente en indicarle al LLM (ya sea mediante instrucciones directas como "piensa paso a paso" o mediante ejemplos) que desglose su proceso de razonamiento en etapas intermedias. Esto mejora drásticamente el rendimiento en tareas lógicas, de servicio al cliente complejas o matemáticas, reduciendo las alucinaciones y errores lógicos.

Análisis de las opciones incorrectas:  
A es incorrecta: Aumentar la temperatura al máximo (2.0) incrementa la aleatoriedad y la "creatividad", lo que en un agente de servicio al cliente aumentaría drásticamente los errores lógicos y las alucinaciones en lugar de reducirlos.

C es incorrecta: El Few-shot Prompting simple da ejemplos de entrada/salida directamente, pero el enunciado de la opción aclara que es "sin explicación intermedia", por lo que no obliga al modelo a estructurar un razonamiento paso a paso.

D es incorrecta: El Zero-shot Prompting pide la respuesta directa sin ejemplos ni guías de razonamiento previo, lo que es propenso a fallas lógicas en problemas complejos.

La respuesta correcta es la C.

¿Por qué es la opción C?  
El enunciado te pregunta específicamente cuál técnica es más efectiva para guiar al modelo a generar código SQL seguro: ¿ReAct o Few-Shot?

Few-Shot Prompting (Opción C): Al proporcionarle al modelo 3 o 4 ejemplos claros de cómo mapear una pregunta en lenguaje natural a su respectiva consulta SQL estructurada, correcta y segura (por ejemplo, previniendo inyección SQL o usando buenas prácticas de la empresa), le estás dando un patrón exacto a seguir. Los LLMs son excelentes replicando estructuras a partir de ejemplos del contexto.

Análisis de las opciones incorrectas:  
A es incorrecta: Self-Consistency se basa en generar múltiples caminos de razonamiento y elegir la respuesta mayoritaria (voto popular), no en elegir la consulta "más corta". Además, que sea más corta no garantiza que sea segura.

B es incorrecta: La técnica ReAct (Reason \+ Act) sirve para que el agente interactúe con herramientas externas en bucle, pero la opción dice erróneamente que sirve para "improvisar la sintaxis SQL", lo cual es propenso a errores de ejecución y vulnerabilidades de seguridad si no tiene una guía previa.

D es incorrecta: El entrenamiento base (Zero-shot) suele fallar o alucinar cuando se requiere seguir un estándar de seguridad muy estricto o un esquema de base de datos corporativo específico.

La respuesta correcta es la D.

¿Por qué es la opción D?  
En el estándar de la industria para APIs de ChatCompletion (establecido inicialmente por OpenAI y adoptado por casi todos los proveedores de LLMs como Anthropic, Google y frameworks como LangChain), el historial de conversación se compone de una lista de objetos de mensajes donde cada uno requiere un campo role.

Los tres roles principales estandarizados son:

system: Define las instrucciones iniciales, personalidad o directrices del modelo.

user: Representa los mensajes o entradas enviados por el humano o usuario final (justo lo que pide la pregunta).

assistant: Representa las respuestas generadas por el modelo de IA.

Análisis de las opciones incorrectas:  
A e B son incorrectas: Aunque conceptualmente se refieren al ser humano o a la entrada de datos, no son palabras clave válidas ni estandarizadas dentro de la estructura JSON que aceptan las APIs de ChatCompletion.

C es incorrecta: El "prompt" es el conjunto completo de instrucciones o el texto que se le envía al modelo, pero no es el nombre técnico del rol asignado a los mensajes individuales del usuario en el historial.

La respuesta correcta es la B.

¿Por qué es la opción B?  
Las cadenas tradicionales (Chains) de LangChain están diseñadas como DAGs (Grafos Acíclicos Dirigidos), lo que significa que el flujo de ejecución es lineal o estrictamente hacia adelante, sin posibilidad de regresar a un paso previo de forma nativa.

LangGraph fue creado específicamente para solucionar esto introduciendo la capacidad de crear flujos cíclicos (bucles o loops). Esto permite implementar flujos de trabajo de agentes mucho más avanzados donde el modelo puede:

Ejecutar una acción.

Evaluar el resultado con una herramienta de control o crítica.

Regresar a un estado anterior para corregir un error o iterar hasta que la respuesta sea óptima.

Análisis de las opciones incorrectas:  
A es incorrecta: LangGraph se centra fuertemente en el manejo del estado. De hecho, añade un "Estado" centralizado (State) que se comparte, actualiza y mantiene de forma explícita a lo largo de todas las interacciones del grafo.

C es incorrecta: LangGraph es totalmente agnóstico al modelo; funciona perfectamente tanto con modelos propietarios (OpenAI, Anthropic) como con modelos de código abierto (Open Source) locales o en la nube (Llama, Mistral, etc.).

D es incorrecta: Aunque introduce control estructurado (nodos y bordes condicionales), sigue siendo un framework diseñado principalmente para coordinar e integrar la toma de decisiones basada en Inteligencia Artificial (LLMs).

La respuesta correcta es la C.

¿Por qué es la opción C?  
Cuando diseñamos agentes autónomos con flujos cíclicos (como bucles while), corremos el riesgo de que el agente entre en un bucle infinito si la tarea es imposible, si hay un error en el código o si el modelo sufre de un bucle de alucinación repetitivo. Esto consume cómputo, tiempo y dinero de la API rápidamente.

Para construir sistemas robustos, es obligatorio implementar un patrón de resiliencia básico:

Maximum Iteration Limit (Límite máximo de pasos): Define una variable (por ejemplo, max\_iterations \= 5\) que detenga forzosamente el ciclo tras un número fijo de intentos, evitando el gasto infinito.

Time-out: Un límite de tiempo absoluto para forzar una salida limpia (graceful exit) y devolver un mensaje de error controlado en lugar de colgar el sistema.

Análisis de las opciones incorrectas:  
A es incorrecta: Bloquear el acceso a internet no soluciona el problema de lógica del bucle local del agente; además, podría requerir internet para sus funciones básicas.

B es incorrecta: Por más estricto que sea un prompt, los LLMs no son perfectos y no pueden evitar de forma determinista un error lógico o una condición de parada en una tarea imposible. El control debe estar en la ingeniería del software que rodea al modelo.

D es incorrecta: Usar un modelo más avanzado (como los modelos de razonamiento tipo o1) reduce fallas lógicas, pero no garantiza el éxito en tareas verdaderamente imposibles. Seguiría necesitando un límite de control por software para evitar un bucle costoso.

La respuesta correcta es la B.

¿Por qué es la opción B?  
El enunciado describe un escenario donde tres agentes proponen decisiones diferentes (y potencialmente contradictorias) sobre la aprobación o rechazo de un crédito. Al simplemente concatenar las respuestas, el "Manager Agent" no está resolviendo el conflicto ni tomando una decisión unificada; solo está juntando textos.

Esto genera un Riesgo de Incoherencia, ya que el sistema final podría terminar con una salida contradictoria (por ejemplo: "Legal aprueba, Financiero aprueba, pero Riesgo rechaza").

La solución arquitectónica correcta es implementar una capa de Voting/Consensus (Votación o Consenso), donde un algoritmo o un agente superior analice las diferencias, pondere los votos o aplique reglas de negocio claras (ej. "si Riesgo rechaza, se rechaza automáticamente todo") para dar un veredicto único y coherente.

Análisis de las opciones incorrectas:  
A es incorrecta: Eliminar al agente de Riesgo para evitar conflictos es una pésima práctica de negocio y de ingeniería; el rol de riesgo es vital para la aprobación de un crédito.

C es incorrecta: El problema planteado es de lógica y consistencia en las decisiones de la IA, no tiene nada que ver con la velocidad de la red o la infraestructura del servidor.

D es incorrecta: El problema no es que los agentes estén inventando información (alucinación), sino que sus criterios válidos y especializados chocan entre sí. Reducir la ventana de contexto no solucionaría el conflicto de intereses de los agentes.

La respuesta correcta es la C.

¿Por qué es la opción C?  
En LangGraph, para crear ramificaciones o bifurcaciones donde la ruta a seguir depende del resultado o del estado actual del grafo, se utiliza explícitamente el método add\_conditional\_edges.

Este método toma tres argumentos principales:

El nodo de origen (en este caso, "analizar").

Una función de enrutamiento (routing function o conditional function) que evalúa el estado y devuelve una cadena de texto (el nombre de la siguiente ruta).

Un mapeo/diccionario que asocia el resultado de esa función con los nodos de destino reales (por ejemplo, {"responder": "responder", "investigar": "investigar"}).

Análisis de las opciones incorrectas:  
A es incorrecta: add\_branch no es un método válido en la API de LangGraph para definir conexiones condicionales entre nodos.

B es incorrecta: add\_edge se utiliza exclusivamente para crear aristas fijas y deterministas. Es decir, conecta el nodo A directamente con el nodo B siempre, sin evaluar ninguna condición intermedia.

D es incorrecta: set\_path no forma parte de los métodos nativos de construcción de la estructura del grafo en LangGraph.

La respuesta correcta es la A.

¿Por qué es la opción A?  
El problema describe un desafío clásico de "multi-hop reasoning" (razonamiento de múltiples saltos). El RAG estándar (basado únicamente en similitud semántica de vectores) falla aquí porque los dos documentos necesarios están aislados en el espacio vectorial y no comparten términos directos que permitan recuperarlos juntos en una sola búsqueda.

GraphRAG resuelve exactamente esto al estructurar la información en un Grafo de Conocimiento (Knowledge Graph).

Extrae las entidades ("Tasa 2023", "Crédito 2024") y define explícitamente las relaciones o conexiones que hay entre ellas (los "bordes" del grafo).

Al consultar el sistema, el LLM puede navegar a través de los nodos vinculados para consolidar la información dispersa y responder de manera precisa conectando los puntos.

Análisis de las opciones incorrectas:  
B es incorrecta: El Re-ranking (reordenamiento) sirve para optimizar la prioridad de los documentos que ya fueron recuperados por el recuperador inicial, pero no puede conectar ni traer documentos aislados que ni siquiera pasaron el primer filtro.

C es incorrecta: El Fine-tuning (ajuste fino) no está diseñado para la memorización confiable de datos dinámicos o fechas exactas; es propenso a alucinaciones y es costoso de actualizar en comparación con arquitecturas de recuperación.

D es incorrecta: Aumentar el Chunk Size (tamaño del fragmento) expande el texto por bloque, pero si los dos documentos son completamente independientes y están en archivos u orígenes distintos, no van a caer en el mismo bloque por azar.

La respuesta correcta es la A.

¿Por qué es la opción A?  
El escenario describe una saturación debido a límites de tasa excedidos (Error 429 Too Many Requests). Cuando el proveedor del LLM bloquea las solicitudes, si el sistema sigue intentando enviar tráfico de forma masiva y descontrolada, el backend colapsa por completo afectando a todos los usuarios concurrentes.

El patrón Circuit Breaker (Disyuntor) está diseñado exactamente para lidiar con fallas de servicios de terceros:

Detecta de forma automática cuando un servicio externo empieza a fallar repetidamente (o a devolver errores de límite como el 429).

Al llegar a un umbral configurado (N fallos), el circuito se "abre" e interrumpe temporalmente el envío de más peticiones al LLM externo.

Durante ese tiempo, protege la infraestructura local y sirve una respuesta de emergencia estática o predefinida de forma inmediata a los usuarios, evitando que el sistema colapse por completo mientras el proveedor se recupera.

Análisis de las opciones incorrectas:  
B es incorrecta: No existe tal cosa como un "Auto-scaling infinito de tokens" controlado por el cliente; los límites de Rate Limit (RPM/TPM) los impone estrictamente el proveedor del LLM (OpenAI, Anthropic, etc.) a nivel de API por motivos de infraestructura.

C es incorrecta: Aunque el Fallback de proveedores es una buena estrategia, el enunciado describe la opción de forma negativa indicando explícitamente que es "complejo y propenso a fallos de autenticación", lo cual lo descarta frente a la opción limpia del Circuit Breaker.

D es incorrecta: Un reinicio manual cada hora no soluciona un problema de saturación de API externa en tiempo real bajo un ataque DDoS o pico de tráfico masivo; solo degradaría la disponibilidad del servicio para los usuarios legítimos.

La respuesta correcta es la B.

¿Por qué es la opción B?  
En LangGraph, el estado (State) actúa como la única fuente de verdad compartida entre los nodos del grafo. Es un esquema estricto (generalmente definido con TypedDict de Python o Pydantic) que determina qué datos se pueden guardar y pasar de un nodo al siguiente.

Si decides crear un esquema personalizado desde cero (sin usar la configuración nativa por defecto) y olvidas incluir una variable de historial en la definición explícita, ocurrirá lo siguiente:

Los nodos solo pueden retornar y actualizar las llaves (keys) que estén explícitamente declaradas en la estructura del esquema.

Al pasar al siguiente nodo, cualquier variable omitida en el esquema se perderá, y el nodo receptor no tendrá acceso a ese contexto previo.

Análisis de las opciones incorrectas:  
A es incorrecta: No genera un bucle infinito en la ejecución del grafo; simplemente arrojará un error de llave faltante (KeyError) cuando un nodo intente leer la variable o el dato se omitirá silenciosamente en el diccionario de estado.

C es incorrecta: LangGraph es un framework con tipado y manejo de estados estrictos; no tiene la capacidad de inferir mágicamente variables de contexto o de historial si el desarrollador no las declaró explícitamente.

D es incorrecta: LangGraph gestiona los estados de manera interna e inmutable utilizando canales (channels); no recurre a variables globales de Python para almacenar información de fondo de forma insegura.

La respuesta correcta es la D.

¿Por qué es la opción D?  
Esta es una pregunta fundamental sobre los principios de diseño y gobernanza en Sistemas Agénticos e Inteligencia Artificial Crítica.

Los Grandes Modelos de Lenguaje (LLMs) son, por naturaleza, modelos probabilísticos, lo que significa que operan bajo estadísticas y predicciones de tokens. Debido a esto, nunca se puede garantizar un 100% de certeza en su comportamiento (siempre existe el riesgo de alucinaciones, malinterpretaciones o errores de lógica).

En operaciones financieras de alto impacto e irreversibles, como lo es una transferencia internacional:

Un margen de precisión del 99.9% suena excelente, pero significa que 1 de cada 1,000 transferencias fallará o se enviará con datos erróneos.

El costo financiero, legal y reputacional de ese 0.1% de error es completamente inaceptable para una entidad bancaria.

Implementar un patrón de Human-in-the-loop (HITL) asegura que un operador humano valide la transacción antes de que el dinero salga del sistema de forma definitiva.

Análisis de las opciones incorrectas:  
A es incorrecta: El objetivo de la validación humana en este paso es la seguridad y la mitigación de riesgos financieros inmediatos, no la recolección de datos para reentrenar el modelo base.

B es incorrecta: Falso. Mediante el uso de Tool Calling (Llamada a herramientas) y funciones, los agentes de IA sí pueden conectarse e interactuar perfectamente con APIs bancarias estructuradas para ejecutar transacciones.

C es incorrecta: Las regulaciones exigen controles de cumplimiento y seguridad (como KYC o prevención de lavado de activos), pero no obligan a que el código SWIFT se digite manualmente letra por letra; los sistemas automatizados lo hacen constantemente bajo supervisión de autorización.

La respuesta correcta es la B.

¿Por qué es la opción B?  
En LangGraph, un Checkpointer es un componente de persistencia fundamental. Su función principal es tomar una "fotografía" o captura del estado actual del grafo (State) después de la ejecución de cada nodo y guardarla de forma segura en una base de datos (como SQLite, PostgreSQL, etc.).

En flujos de larga duración o complejos, sirve para:

Persistencia de memoria: Permite que el agente recuerde conversaciones o estados a lo largo de días o semanas.

Tolerancia a fallos: Si el servidor se apaga o hay un error de red a mitad de un proceso largo, el flujo puede reanudarse exactamente desde el último nodo exitoso sin perder el progreso.

Interrupción humana (Human-in-the-loop): Permite pausar el grafo indefinidamente a la espera de una aprobación humana y retomar el camino exacto una vez recibida la señal.

Análisis de las opciones incorrectas:  
A es incorrecta: El formateo u ortografía es una tarea de prompt o de un modelo intermedio; no tiene relación con el almacenamiento de estados del Checkpointer.

C es incorrecta: La telemetría y métricas de rendimiento (latencia, costos de tokens) se gestionan con herramientas especializadas de observabilidad como LangSmith o OpenTelemetry, no con checkpointers.

D es incorrecta: La seguridad frente a inyecciones de prompt (Prompt Injection) se maneja con capas de firewall de LLMs (como Guardrails), no mediante la persistencia de estados.

La respuesta correcta es la B.

¿Por qué es la opción B?  
El término Grounding (Anclaje) en el contexto de agentes e IA corporativa se refiere al proceso de vincular las respuestas del modelo a fuentes de información externas, verídicas y verificables (como los repositorios documentales de la empresa, bases de datos o manuales internos).

Su propósito principal es:

Conectar con la realidad corporativa: El modelo base no conoce los datos privados de la empresa; el anclaje le provee ese contexto exacto en tiempo de ejecución.

Reducir alucinaciones: Al obligar al agente a responder basándose únicamente en los documentos recuperados y exigirle citar las fuentes de donde extrajo la información, se minimiza drásticamente la invención de datos falsos.

Análisis de las opciones incorrectas:  
A es incorrecta: Forzar estructuras JSON validadas es una tarea de Structured Outputs (salidas estructuradas) o esquemas Pydantic, no del anclaje de conocimiento.

C es incorrecta: Los adaptadores LoRA son técnicas de Fine-tuning eficiente para alterar los pesos internos de una red neuronal, lo cual no tiene relación con el uso de herramientas de anclaje de documentos (arquitectura tipo RAG).

D es incorrecta: El anclaje añade un paso extra de búsqueda y procesamiento, por lo que típicamente incrementa ligeramente la latencia en lugar de optimizarla, y bajo ninguna circunstancia busca omitir las verificaciones de seguridad.

La respuesta correcta es la A.

¿Por qué es la opción A?  
En una arquitectura de sistemas multi-agente complejos, un Router (Enrutador) actúa como el punto de decisión central o la "recepción" del sistema.

Su función principal es analizar la entrada del usuario en lenguaje natural, clasificar su intención o necesidad, y tomar la decisión lógica de enviar esa solicitud hacia el sub-agente o la herramienta especializada idónea para resolverla.

Por ejemplo: Si el usuario dice "¿Cuál es mi saldo?", el Router clasifica la intención como financiera y redirige el flujo al Agente de Cuentas. Si dice "Tengo un problema con el contrato", lo enruta hacia el Agente Legal.

Análisis de las opciones incorrectas:  
B es incorrecta: El almacenamiento de registros (logs) de la conversación en disco es una tarea de persistencia de datos o auditoría, típicamente delegada a bases de datos o sistemas de logging.

C es incorrecta: Aquí se confunde el término de "Router" lógico de software de IA con un router físico de redes informáticas de hardware. Los agentes no obtienen internet mediante este componente de software.

D es incorrecta: La encriptación y seguridad de los canales de transporte (como HTTPS o TLS) es responsabilidad de la capa de infraestructura o de la pasarela de la API (API Gateway), no de la lógica de enrutamiento del agente.

La respuesta correcta es la D.

¿Por qué es la opción D?  
Para implementar el patrón de Human-in-the-loop (HITL) en un flujo crítico con LangGraph, la funcionalidad nativa diseñada específicamente para pausar la ejecución del grafo se conoce como Breakpoint (Punto de interrupción).

Cuando configuras un interrupt\_before (o interrupt\_after) en un nodo específico (en este caso, antes del nodo que ejecuta transferir\_fondos), LangGraph realiza lo siguiente de manera automática junto con el Checkpointer:

Ejecuta el flujo normalmente hasta llegar justo antes del nodo protegido.

Detiene por completo la ejecución del grafo y guarda el estado actual en la persistencia.

El sistema queda a la espera de una acción externa (la aprobación del humano desde una interfaz o sistema de administración).

Una vez que el humano aprueba, el grafo recibe una señal de continuación (resume) y ejecuta la acción financiera de forma segura.

Análisis de las opciones incorrectas:  
A es incorrecta: Apagar físicamente el contenedor de Docker o del servidor es una solución destructiva de infraestructura que rompería las conexiones de red y los estados activos de la aplicación; no es una función de software de LangGraph.

B es incorrecta: Un conditional\_edge aleatorio enviaría el flujo a un nodo equivocado o generaría bucles lógicos sin sentido, en lugar de pausar de forma limpia el sistema a la espera de un humano.

C es incorrecta: Un ciclo while infinito bloquea el hilo de ejecución del servidor de manera síncrona, elevando el uso de CPU al 100% y arriesgando un desbordamiento de memoria o la caída total del servicio.

La respuesta correcta es la D.

¿Por qué es la opción D?  
El problema expone una limitación clásica de los extractores de PDF estándar basados en texto plano (como pypdf o PyMuPDF simples): cuando leen una tabla de forma linealizada, mezclan las filas y columnas destruyendo las relaciones visuales de los datos. Al vectorizar ese texto plano plano e inconexo, el LLM es incapaz de interpretar correctamente qué tarifa corresponde a cada concepto.

La solución óptima de ingeniería de ingestión de datos consiste en:

Utilizar un modelo multimodal (con visión por computadora capaz de leer la estructura de la página) o un parser especializado en documentos y tablas (como LlamaParse, Unstructured o Azure Document Intelligence).

Convertir la estructura bidimensional de la tabla a un formato semiestructurado legible por texto como Markdown (usando pipes |) o un objeto JSON antes de generar los embeddings. Esto preserva intacta la relación fila/columna en la memoria contextual del modelo.

Análisis de las opciones incorrectas:  
A e B son incorrectas: Modificar el tamaño del chunk (bloque) o el overlap (solapamiento) no sirve de nada si el texto extraído ya viene corrupto, desordenado y sin su estructura de matriz original. Seguirá alimentando al LLM con datos mezclados.

C es incorrecta: El Fine-tuning no soluciona un problema de extracción de la capa de datos. Un LLM no puede aprender "coordenadas de un PDF" leyendo texto plano mal estructurado; se requiere corregir el flujo de ingestión previo a la vectorización.

La respuesta correcta es la D.

¿Por qué es la opción D?  
En la sintaxis moderna LCEL (LangChain Expression Language), todos los componentes (prompts, LLMs, output parsers, chains, etc.) implementan la interfaz estándar conocida como Runnable Protocol.

Este protocolo define métodos estándar específicos para interactuar con las cadenas, siendo los principales:

invoke: Se utiliza para ejecutar la cadena con un solo input de forma síncrona (justo lo que pide el enunciado). Por ejemplo: chain.invoke({"input": "hola"}).

ainvoke: Es la versión asíncrona para ejecutar la cadena con un input.

stream: Devuelve la respuesta en trozos de texto en tiempo real de forma síncrona.

batch: Ejecuta la cadena sobre una lista de múltiples inputs de forma eficiente.

Análisis de las opciones incorrectas:  
A, B y C son incorrectas: Los métodos call, run y execute pertenecen a arquitecturas o versiones antiguas de LangChain (anteriores al estándar LCEL de la interfaz Runnable), o bien son términos lógicos comunes en otros lenguajes de programación, pero no son el método oficial del protocolo moderno de LangChain.

La respuesta correcta es la C.

¿Por qué es la opción C?  
El escenario describe una situación crítica de negocio (procesamiento de cheques bancarios) donde se exige un 100% de precisión.

Al igual que en problemas anteriores, los modelos basados en Inteligencia Artificial y Visión por Computadora son probabilísticos; siempre existe un margen de confusión con caracteres manuscritos similares (como el "1" y el "7"). Ningún modelo automático puede garantizar por sí solo el 100% de éxito.

La estrategia adecuada para cumplir con la regla de negocio es implementar un patrón de Human Fallback (Soporte o mitigación humana):

El modelo de visión analiza el cheque y devuelve una predicción junto con un score de confianza (por ejemplo, 85% de seguridad).

Si el score de confianza cae por debajo de un umbral seguro preestablecido (ej. menos de 98%), el sistema detiene el proceso automático y desvía el cheque a una cola de revisión manual para que un cajero u operador humano verifique los datos.

Análisis de las opciones incorrectas:  
A es incorrecta: Un Ensemble (conjunto de modelos) reduce fallas y mejora el rendimiento general, pero si los tres modelos sufren del mismo sesgo o la caligrafía es genuinamente ambigua, seguirán promediando un error. No garantiza el 100% exigido.

B es incorrecta: Es teóricamente imposible "reducir el error a cero" en datos de producción reales del mundo real simplemente aumentando las épocas de entrenamiento; esto solo causaría un sobreajuste masivo (overfitting) arruinando la capacidad del modelo para leer otros cheques.

D es incorrecta: No es una solución técnica viable ni práctica para la experiencia del usuario o la operación del banco rechazar sistemáticamente los cheques pidiéndole al cliente que vuelva a escribir a mano.

La respuesta correcta es la B.

¿Por qué es la opción B?  
Un Embedding (Incrustación) es el componente base para el funcionamiento de cualquier sistema RAG (Retrieval-Augmented Generation). Consiste en transformar una pieza de texto (palabras, frases o documentos completos) en un vector de números reales (una lista larga de números, por ejemplo, de 1536 dimensiones).

La magia de los embeddings es que están diseñados matemáticamente para capturar el significado semántico y el contexto del texto original.

Textos que expresan ideas similares o relacionadas (ej. "¿Cómo solicito una tarjeta de crédito?" y "Pasos para adquirir un plástico bancario") quedarán ubicados muy cerca el uno del otro dentro del espacio geométrico vectorial, permitiendo que el sistema RAG los recupere eficientemente por similitud aunque no compartan las mismas palabras exactas.

Análisis de las opciones incorrectas:  
A es incorrecta: Una base de datos relacional (como PostgreSQL o MySQL) almacena tablas con filas y columnas. Para almacenar vectores de embeddings se utilizan herramientas distintas llamadas Bases de Datos Vectoriales (como Pinecone, Milvus, Chroma o extensiones como pgvector).

C es incorrecta: Un algoritmo hash (como SHA-256) es una función de encriptación unidireccional y determinista para seguridad. Si cambias una sola letra del texto, el hash cambia por completo y destruye cualquier noción de significado semántico.

D es incorrecta: Un resumen de texto es texto en lenguaje natural acortado. Un embedding es estrictamente una lista matemática de coordenadas numéricas.

Esta es la misma pregunta que respondimos en el paso anterior. Ya has marcado la opción correcta. Puedes hacer clic con total confianza en el botón "Siguiente" para avanzar en tu evaluación.

Como recordatorio rápido por si quieres validar el concepto antes de avanzar:

La respuesta seleccionada (B) es la correcta porque un Embedding toma palabras o frases y las traduce a una lista de números (vectores) de manera que el sistema pueda medir matemáticamente qué tan cerca están dos ideas en significado (su semántica), que es el pilar para que un RAG bancario busque regulaciones, saldos o manuales sin perder el contexto.

La respuesta correcta es la B.

¿Por qué es la opción B?  
Este es uno de los conceptos peor interpretados en el desarrollo de agentes. En el proceso de Function Calling (Llamada a funciones), el LLM nunca ejecuta el código por sí mismo. Su rol es puramente lingüístico y de estructuración de datos.

El flujo real funciona así:

Le pasas al LLM la pregunta del usuario y una descripción (esquema JSON) de las herramientas disponibles.

El LLM procesa el texto y decide que necesita usar una herramienta.

El LLM extrae los datos necesarios de la conversación y genera una estructura JSON estructurada con los argumentos exactos requeridos por la función (por ejemplo: {"ciudad": "Bogotá", "moneda": "COP"}).

El LLM se detiene ahí. Es tu código de backend (el software cliente o framework como LangChain) el que toma ese JSON, ejecuta la función real (en Python, JavaScript, etc.), obtiene el resultado y se lo devuelve al LLM para que redacte la respuesta final.

Análisis de las opciones incorrectas:  
A es incorrecta: El LLM no navega por la web para aprender a usar la API en tiempo real; depende estrictamente de las descripciones semánticas que tú le pases previamente en el prompt del sistema.

C es incorrecta: Los LLMs no pueden procesar código Python de manera nativa dentro de su red neuronal; solo manejan transformaciones probabilísticas de texto (o tokens).

D es incorrecta: El modelo no tiene acceso ni reescribe el código fuente de tu aplicación; solo interactúa con ella mediante la especificación de argumentos en formato JSON.

La respuesta correcta es la D.

¿Por qué es la opción D?  
El problema describe una falla común en sistemas RAG tradicionales: las preguntas de los usuarios (especialmente las hipotéticas o abstractas) no se parecen textualmente a la estructura de los documentos técnicos almacenados en la base de datos vectorial, lo que produce una mala recuperación semántica.

La técnica HyDE (Hypothetical Document Embeddings) soluciona esto invirtiendo el orden tradicional mediante los siguientes pasos:

Toma la pregunta del usuario (ej. "¿Qué pasaría si falla el servidor principal?").

Le pide a un LLM que genere una respuesta hipotética ideal (un documento falso o fake que asuma cómo se vería la respuesta perfecta).

En lugar de vectorizar la pregunta original, se vectoriza este documento hipotético.

Se utiliza este embedding hipotético para buscar documentos reales en la base de datos. Como la estructura y el tono de una "respuesta" se parecen mucho más a otros documentos reales que a una "pregunta", la recuperación es infinitamente más precisa.

Finalmente, usa esos documentos reales recuperados para generar la respuesta definitiva y verídica.

Análisis de las opciones incorrectas:  
A es incorrecta: Restringir la búsqueda a coincidencias exactas (Lexical Search o BM25) empeoraría radicalmente el problema, ya que las preguntas hipotéticas rara vez contienen las palabras clave exactas de los manuales técnicos o normativos.

B es incorrecta: Traducir a inglés puede ayudar marginalmente si el modelo base tiene mejor desempeño en ese idioma, pero no cambia el hecho de que sigue buscando una estructura de "pregunta" en lugar de un formato de "respuesta".

C es incorrecta: Aumentar el top\_k a 100 solo inundará el contexto del LLM con una enorme cantidad de ruido y documentos irrelevantes, incrementando costos, latencia y la probabilidad de que el modelo sufra de alucinaciones.

La respuesta correcta es la D.

¿Por qué es la opción D?  
En un patrón de diseño multi-agente basado en un workflow jerárquico (Hierarchical Workflow), la arquitectura emula la estructura organizativa de una empresa tradicional:

Manager Agent (Agente Gestor): Es el supervisor central. No realiza el trabajo operativo directamente. Su responsabilidad es recibir la solicitud principal del usuario, descomponerla en subtareas lógicas, delegar esas tareas a los agentes subordinados especializados correspondientes y, finalmente, recibir, supervisar y consolidar sus respuestas en un único resultado coherente.

Worker Agents (Agentes subordinados): Son especialistas técnicos (ej. un agente experto en SQL, otro en búsquedas web, otro en redacción) que ejecutan la instrucción específica que les asignó el Manager.

Análisis de las opciones incorrectas:  
A es incorrecta: El almacenamiento y la persistencia de datos del sistema es responsabilidad de una base de datos (relacional, vectorial o un componente como el Checkpointer), no de la lógica de un agente gestor.

B es incorrecta: La conversión a formatos web como HTML/CSS es una tarea de formateo de salida de software o de un parser de diseño, no la responsabilidad arquitectónica de un agente de orquestación.

C es incorrecta: Es el caso opuesto. Si el Manager ejecutara todas las herramientas por sí mismo, se perdería el propósito del workflow jerárquico y multi-agente, convirtiéndose en un agente único monolítico muy complejo y difícil de mantener.

La respuesta correcta es la B.

¿Por qué es la opción B?  
En LangChain, la forma más rápida, limpia y estándar de transformar una función nativa de Python en una herramienta (Tool) compatible con un agente es utilizando el decorador @tool (importado desde langchain\_core.tools o langchain.agents).

Este decorador es extremadamente potente porque utiliza la introspección de Python para extraer automáticamente:

El nombre de la herramienta: Toma por defecto el nombre de la función en Python.

La descripción semántica: Lee el docstring de la función para explicarle al LLM con precisión cuándo y para qué sirve usar esa herramienta.

El esquema de los argumentos: Analiza los type hints (tipos de datos como int, str, etc.) para estructurar el esquema de validación (usando Pydantic por debajo) que el LLM debe rellenar al hacer el Function Calling.

Análisis de las opciones incorrectas:  
A, C y D son incorrectas: Los decoradores @agent\_action, @langchain\_function y @langchain\_tool no existen en la API oficial de LangChain. Son nombres inventados o aproximaciones conceptuales falsas diseñadas como distractores en el examen.

La respuesta correcta es la D.

¿Por qué es la opción D?  
El problema describe el fenómeno conocido como pérdida de contexto en las fronteras de fragmentación. Al dividir un contrato legal (u otro documento extenso) de manera rígida, una idea o cláusula crítica puede quedar partida justo a la mitad: el inicio en el fragmento 1 y el final en el fragmento 2\. Como consecuencia, el motor RAG recuperará solo uno de los dos bloques sueltos y el LLM no tendrá la información completa para responder.

Para solucionar esto de manera estándar, se debe ajustar el parámetro Chunk Overlap (Solapamiento de fragmentos) aumentando su valor:

El Chunk Overlap define cuántos caracteres o tokens del final de un fragmento se van a repetir y duplicar al inicio del fragmento siguiente.

Al incrementar este número, se crea una zona de transición común más amplia entre bloques continuos, garantizando que los datos ubicados en los límites no pierdan su sentido ni coherencia semántica al ser indexados.

Análisis de las opciones incorrectas:  
A es incorrecta: Cambiar a un modelo multilingüe ayuda si el contrato está en un idioma distinto u opera con traducciones, pero no resuelve en absoluto el corte físico o la amputación del texto entre bloques.

B es incorrecta: Disminuir drásticamente el tamaño del chunk empeoraría notablemente el problema, ya que los bloques más pequeños cortarán los párrafos y las cláusulas legales con una frecuencia mucho mayor, rompiendo aún más el contexto.

C es incorrecta: Usar un modelo de visión (OCR) es útil si el PDF está escaneado como imagen o contiene tablas visuales complejas, pero si el problema es que el texto ya extraído se fragmentó de forma inadecuada en el software, el OCR no modificará la lógica de división de bloques del backend.

La respuesta correcta es la D.

¿Por qué es la opción D?  
En la arquitectura de agentes modernos, la capacidad de tomar decisiones dinámicas sobre qué acción tomar o qué herramienta utilizar recae exclusivamente en el cerebro del sistema: el LLM.

A través de técnicas como Function Calling o el método bind\_tools en LangChain, el desarrollador le "asocia" las herramientas disponibles (como una herramienta de búsqueda y una calculadora) al modelo de lenguaje.

Cuando ingresa el input del usuario:

El LLM analiza semánticamente el texto.

Si el usuario pregunta "¿Cuánto es 456 por 78?", el LLM reconoce de forma inteligente que debe invocar la calculadora.

Si el usuario pregunta "¿Quién ganó el torneo ayer?", el LLM decide que requiere usar la herramienta de búsqueda web.

El software que rodea al agente simplemente ejecuta la herramienta que el LLM seleccionó.

Análisis de las opciones incorrectas:  
A es incorrecta: El Vector Store sirve para almacenar e indexar fragmentos de documentos y recuperarlos por similitud semántica (arquitectura RAG), pero no tiene capacidades lógicas para razonar o decidir si se debe llamar a una API de calculadora.

B es incorrecta: La memoria de corto plazo (Buffer Memory) guarda los mensajes anteriores de la conversación para mantener el hilo del diálogo, pero no decide qué herramienta externa ejecutar.

C es incorrecta: El Output Parser toma la respuesta cruda de texto generada por el LLM y la convierte en un formato estructurado de código (como un diccionario de Python o un objeto JSON), pero la decisión de qué herramienta usar ya fue tomada previamente por el modelo de lenguaje.

La respuesta correcta es la D.

¿Por qué es la opción D?  
El enunciado describe un sesgo de atención muy conocido en los Grandes Modelos de Lenguaje (LLMs) denominado "Lost in the middle" (Perdido en el medio).

Diversos estudios e investigaciones técnicas han demostrado que cuando a un LLM se le alimenta con un contexto muy largo (por ejemplo, muchos documentos recuperados por un RAG), el modelo tiene un excelente rendimiento extrayendo información si esta se encuentra:

Al principio del contexto (efecto de primacía).

Al final del contexto (efecto de recencia).

Sin embargo, la capacidad del modelo para recordar o prestar atención a los detalles cae drásticamente si la información clave se encuentra sepultada en el medio del bloque de texto proporcionado.

¿Cómo se mitiga?  
Se soluciona utilizando un componente de Re-ranking (Reordenamiento). Después de que el recuperador inicial extrae los documentos de la base de datos vectorial, un modelo reranker (como Cohere Rerank o BGE-Reranker) evalúa con precisión milimétrica la relevancia de cada fragmento y los reordena estratégicamente para colocar los fragmentos más críticos e importantes al inicio o al final de la ventana de contexto antes de enviárselos al LLM.

Análisis de las opciones incorrectas:  
A es incorrecta: El problema describe un fallo en la precisión y análisis lingüístico del contenido por parte del modelo, no un corte de conexión o límite de tiempo (Timeout) en las llamadas del servidor.

B es incorrecta: El Overfitting (sobreajuste) es un problema que ocurre durante la fase de entrenamiento de una red neuronal si se memoriza el dataset. En este escenario, estamos consumiendo un modelo ya entrenado en una arquitectura RAG.

C es incorrecta: La temperatura influye en la creatividad y aleatoriedad del texto generado, pero no es la causa de que el modelo ignore específicamente la información ubicada en el centro geométrico de los documentos largos.

Va

La respuesta correcta es la C.

¿Por qué es la opción C?  
En el ámbito del aprendizaje automático y las bases de datos vectoriales (como Chroma, Pinecone, FAISS, Milvus, etc.), el algoritmo estándar para encontrar los elementos más cercanos en un espacio vectorial se llama K-Nearest Neighbors (k-NN) o K Vecinos Más Cercanos.

Por convención matemática y de desarrollo en la industria, el parámetro k (a menudo expresado en código de frameworks como LangChain o LlamaIndex como top\_k) es la variable exacta que define la cantidad de documentos o fragmentos más similares que deseas recuperar. En tu caso, configurarías k=4.

Análisis de las opciones incorrectas:  
A es incorrecta: top\_docs puede ser un nombre conceptual o una descripción en lenguaje natural de lo que buscas, pero no es el término o parámetro matemático estándar en las APIs de búsqueda vectorial.

B es incorrecta: El parámetro n se utiliza comúnmente en estadística para denotar el tamaño total de una muestra o en procesamiento de lenguaje natural para los n-gramas, pero no para limitar los resultados de una búsqueda por similitud de vecinos más cercanos.

D es incorrecta: limit es la palabra clave estándar utilizada en bases de datos relacionales tradicionales (como consultas SQL) para truncar el número de filas devueltas, pero las bases de datos vectoriales se basan en la terminología matemática del algoritmo k-NN.

La respuesta correcta es la A.

¿Por qué es la opción A?  
El escenario describe una falla en la calibración espacial de tu motor de búsqueda vectorial. Al buscar "Tasa de interés", el sistema te está devolviendo "Tasa de cambio" en lugar de "Créditos". Esto ocurre porque la distancia matemática entre los vectores de texto no está reflejando de forma óptima la afinidad del negocio conceptual.

En sistemas de búsqueda semántica basados en densos vectores de embeddings, la métrica matemática estándar y más efectiva para evaluar el ángulo y la orientación de dos vectores independientes es la Similitud Coseno (Cosine Similarity).

Esta métrica mide el coseno del ángulo formado por dos vectores en un espacio multidimensional.

Si el ángulo es 0   
∘  
  (Coseno \= 1), significa que los vectores apuntan en la misma dirección exacta (máxima similitud semántica).

Revisar, calibrar o cambiar el umbral de corte (threshold) de la Similitud Coseno es la acción directa que debes tomar en el Vector Store para ajustar qué tan estricta es la aproximación conceptual del bot bancario.

Análisis de las opciones incorrectas:  
B es incorrecta: La Distancia Levenshtein mide la cantidad mínima de operaciones (inserciones, eliminaciones, sustituciones) para transformar una cadena de caracteres en otra a nivel literal. No entiende el significado semántico; diría erróneamente que "Tasa de interés" y "Tasa de cambio" son muy similares solo porque comparten la palabra de texto "Tasa de".

C es incorrecta: TF-IDF es una técnica tradicional de recuperación de información léxica basada en estadísticas de conteo y frecuencia de palabras clave exactas. No opera sobre vectores continuos de significado (embeddings) ni soluciona problemas de contexto semántico abstracto de manera nativa.

D es incorrecta: La Clave Primaria (PK) es un concepto de bases de datos relacionales estructuradas (SQL) para indexar registros y asegurar que no haya duplicados únicos por ID. No tiene relación alguna con la geometría ni con el cálculo de distancias vectoriales de IA.

La respuesta correcta es la C.

¿Por qué es la opción C?  
El escenario expone un conflicto clásico de obsolescencia de datos en sistemas de producción. Dado que la base de datos vectorial guarda representaciones geométricas del significado, una política de 2022 y una de 2024 sobre el mismo tema serán vectorialmente muy similares y competirán directamente en una búsqueda por cercanía. Si la política antigua tiene una redacción ligeramente más cercana a la duda del usuario, el motor la recuperará por encima de la nueva.

Para solucionar este conflicto desde la perspectiva de la ingeniería de datos, la estrategia correcta es implementar una arquitectura Time-Aware Retrieval (Recuperación consciente del tiempo) combinada con higiene de datos:

Filtros de metadatos: Al indexar documentos, se añade de forma obligatoria un campo de metadatos con la fecha de vigencia o versión (ej. {"status": "active", "year": 2024}). En tiempo de ejecución, el sistema aplica un filtro rígido para excluir automáticamente cualquier documento marcado como obsoleto o archivado ({"status": "deprecated"}), asegurando que el LLM reciba únicamente la información vigente.

Análisis de las opciones incorrectas:  
A es incorrecta: Aumentar el Top-K para recuperar ambos documentos y dejar que el LLM decida incrementa los costos de tokens y duplica el riesgo de confusión. El modelo de lenguaje podría seguir prefiriendo las instrucciones de 2022 si no entiende con claridad el orden cronológico del contexto.

B es incorrecta: Una ventana de contexto gigantesca (como 1 millón de tokens) no resuelve el conflicto de contradicción lógica interna entre dos normativas opuestas que se le entregan al mismo tiempo al modelo.

D es incorrecta: Modificar el prompt del sistema diciéndole que "sea actual" es inútil si la capa de ingeniería de datos (el recuperador RAG) le está inyectando físicamente únicamente el texto de la política de 2022 al contexto. El LLM no puede adivinar la información de 2024 si esta no fue recuperada de la base de datos.

La respuesta correcta es la A.

¿Por qué es la opción A?  
El escenario describe un problema clásico de escalabilidad geométrica en bases de datos vectoriales. Cuando el volumen de datos alcanza una escala considerable (como 10 millones de documentos), realizar una búsqueda exacta por fuerza bruta (comparar el vector de consulta contra absolutamente cada uno de los 10 millones de vectores guardados usando operaciones como K-NN exacto) se vuelve computacionalmente inviable, elevando la latencia a segundos (5s).

Para optimizar y resolver este problema de latencia masiva a gran escala, la arquitectura requiere implementar algoritmos de búsqueda aproximada o ANN (Approximate Nearest Neighbors):

En lugar de calcular distancias de forma secuencial y exhaustiva, los algoritmos ANN agrupan o indexan los vectores de forma inteligente en estructuras pre calculadas de grafos o árboles (como HNSW \- Hierarchical Navigable Small World, IVF \- Inverted File Index, o PQ \- Product Quantization).

Al consultar, el sistema solo busca dentro del subgrupo de vectores que geométricamente tienen más probabilidad de ser cercanos al vector de consulta.

Esto reduce la complejidad temporal drásticamente de un costo lineal a sublineal o logarítmico, bajando la latencia de 5 segundos a milisegundos, sacrificando únicamente una fracción milimétrica e imperceptible de precisión conceptual (recall).

Análisis de las opciones incorrectas:  
B es incorrecta: Aunque un almacenamiento físico rápido en SSD NVMe mejora la velocidad de lectura/escritura en disco en bases de datos relacionales tradicionales, la búsqueda por fuerza bruta sobre 10 millones de vectores de alta dimensión satura principalmente la CPU/RAM (por cálculo matricial), por lo que el hardware de disco no resolverá el cuello de botella lógico.

C es incorrecta: Eliminar de forma manual documentos duplicados es una tarea cosmética e insuficiente de limpieza que no altera el orden de magnitud del problema; pasar de 10 millones a 9.5 millones de vectores mantendrá una latencia inaceptable bajo una búsqueda exacta.

D es incorrecta: La compresión GZIP reduce el tamaño de almacenamiento físico de archivos de texto plano, pero para realizar una búsqueda vectorial, los vectores numéricos deben estar completamente descomprimidos en memoria RAM. Comprimir el texto original antes de vectorizar no tiene ningún impacto positivo en el cómputo del espacio embebido.

La respuesta correcta es la D.

¿Por qué es la opción D?  
El escenario describe una de las fallas más graves de seguridad y privacidad en el desarrollo de aplicaciones web y sistemas agénticos: la fuga de datos entre hilos de usuarios (cross-user data leakage).

Cuando un agente se expone en un entorno multi-usuario, el sistema debe garantizar un aislamiento absoluto del contexto de cada persona:

Falla en la gestión de Session IDs: Si el backend mezcla o no valida de manera estricta los identificadores de sesión individuales (session\_id), las variables que almacenan el historial del Usuario A pueden ser leídas por la petición en curso del Usuario B.

Memoria global compartida: Ocurre comúnmente en código mal estructurado si utilizas una instancia única o global (como un objeto singleton desprotegido en Python o variables a nivel de módulo) para almacenar el historial de conversación (BufferMemory o estados del grafo), en lugar de instanciar y recuperar un objeto de memoria completamente nuevo, aislado y dinámico mapeado específicamente al identificador único de cada sesión desde la base de datos.

Análisis de las opciones incorrectas:  
A es incorrecta: Las bases de datos vectoriales almacenan colecciones estáticas de conocimiento corporativo indexado que son idénticas para todos. Si un índice se corrompe, causaría errores en las consultas de software (Error 500\) o devolvería documentos incoherentes para todos los usuarios, pero no causaría de forma selectiva que el historial de un chat privado vivo se inyecte en otro chat paralelo.

B es incorrecta: Un ataque de Prompt Injection (inyección de prompt) ocurre cuando un usuario malintencionado manipula el input con instrucciones maliciosas para saltarse las directrices de seguridad del sistema. No tiene la capacidad mágica de alterar los canales de memoria interna del servidor web para jalar conversaciones ajenas.

C es incorrecta: El Data Leakage o fuga de datos en entrenamiento es un concepto de ciencia de datos que ocurre cuando introduces datos de prueba (test dataset) dentro del conjunto de entrenamiento (train dataset), provocando que las métricas del modelo sean falsamente optimistas. No tiene ninguna relación con mezclar chats en tiempo real en producción.

La respuesta correcta es la D.

¿Por qué es la opción D?  
El escenario presenta un dilema clásico en conversaciones extensas con LLMs: la ventana de contexto tiene un límite estricto de tokens. Si sigues enviando todos los mensajes anteriores, eventualmente superarás ese límite y la API arrojará errores de desbordamiento de contexto. Sin embargo, el negocio exige no perder el contexto general.

Para balancear ambas necesidades (ahorrar tokens y retener las ideas generales), el patrón de diseño óptimo es ConversationSummaryMemory (Memoria de resumen de conversación):

En lugar de almacenar y reenviar el historial completo palabra por palabra, este sistema utiliza un LLM secundario (o una llamada en segundo plano) para resumir progresivamente la conversación a medida que avanza.

El prompt del agente solo recibe el resumen compacto condensado de todo lo que pasó antes más las últimas interacciones vivas. Esto mantiene el consumo de tokens bajo un límite plano y controlado sin importar qué tan larga sea la sesión, logrando que el agente financiero mantenga presentes los acuerdos o datos generales compartidos al inicio.

Análisis de las opciones incorrectas:  
A es incorrecta: ConversationBufferMemory almacena y envía el historial crudo completo. Esto es justamente lo que causó el problema original y es lo opuesto a una solución eficiente para chats largos.

B es incorrecta: Redis o la memoria RAM local solucionan el almacenamiento físico y la velocidad de lectura del historial en tu backend, pero no disminuyen el tamaño ni la cantidad de tokens del texto que le envías a la API del LLM; el modelo seguiría desbordándose.

C es incorrecta: El modo Stateless (sin estado) elimina toda la memoria e ignora la conversación pasada enviando únicamente el último mensaje. Aunque ahorra tokens de forma masiva, viola directamente la restricción del enunciado de "no quieres perder el contexto general".

La respuesta correcta es la D.

¿Por qué es la opción D?  
El escenario plantea un problema de interoperabilidad en un ecosistema abierto de IA corporativa: diferentes agentes creados por distintos proveedores o con distintas tecnologías no hablan el mismo "idioma" técnico, lo que les impide compartir datos o usar las herramientas del otro.

La solución estándar de la industria es MCP (Model Context Protocol):

El Model Context Protocol (MCP) es un estándar abierto desarrollado específicamente para resolver este problema (popularizado e impulsado fuertemente por Anthropic y la comunidad de código abierto).

Funciona de manera similar a cómo el protocolo USB estandarizó los periféricos físicos o cómo REST/GraphQL estandarizaron las APIs de desarrollo web.

Al implementar MCP, todos los agentes y servidores de herramientas adoptan un formato universal uniforme para exponer herramientas, compartir datos de contexto y estructurar prompts. Esto permite que un agente de Crédito de un proveedor colabore e interactúe de forma nativa e inmediata con un agente de Seguros de otro proveedor sin tener que escribir integraciones a medida (point-to-point) para cada uno.

Análisis de las opciones incorrectas:  
A es incorrecta: Desarrollar un "Super Agente" monolítico va en contra de las buenas prácticas de arquitectura de software. Un sistema monolítico gigante es extremadamente difícil de mantener, escalar, probar y acopla de manera destructiva lógicas de negocio totalmente dispares (como Crédito y Seguros).

B es incorrecta: Obligar a usar un único modelo fundacional (como GPT-4) no resuelve el problema de la infraestructura de software. Aunque usen el mismo modelo base, si las APIs, esquemas de datos y herramientas de los proveedores siguen siendo incompatibles, los agentes no podrán colaborar de forma automatizada.

C es incorrecta: Una base vectorial centralizada es excelente para que compartan cierta documentación o conocimiento estático (Knowledge Base), pero no soluciona la capa operativa: cómo invocan herramientas de manera mutua, cómo gestionan el flujo de control o cómo negocian tareas dinámicas en tiempo real.

La respuesta correcta es la A.

¿Por qué es la opción A?  
El escenario se enfoca en la velocidad de desarrollo para una prueba de concepto (PoC) donde tienes datos distribuidos en formatos muy heterogéneos: un PDF, un archivo de Word (.docx) y páginas estructuradas en HTML. Escribir parsers e integraciones manuales personalizados para cada formato te tomaría días de desarrollo.

LlamaIndex destaca en el ecosistema de IA precisamente por su capa de conectores de datos. La ventaja principal que ofrece para este caso es su repositorio integrado LlamaHub:

Data Loaders listos para usar: LlamaHub contiene una colección masiva de lectores e integraciones preconstruidas por la comunidad y el equipo oficial.

Con solo un par de líneas de código (por ejemplo, usando SimpleDirectoryReader), LlamaIndex detecta automáticamente las extensiones, extrae el texto limpio de archivos PDF, Word e HTML de forma nativa y los transforma inmediatamente en estructuras de nodos listas para ser vectorizadas.

Análisis de las opciones incorrectas:  
B es incorrecta: LlamaIndex es un framework enfocado estrictamente en la orquestación e indexación de datos en tiempo de ejecución (arquitecturas RAG y búsqueda en bases de datos vectoriales); no realiza tareas automáticas de Fine-Tuning (reentrenamiento de pesos) sobre el modelo base al cargar los archivos.

C es incorrecta: La cuantización dinámica es una técnica avanzada de optimización de hardware y compresión de modelos (como pasar de FP16 a INT8) para reducir el consumo de GPU durante la inferencia; no tiene ninguna relación con la lectura o ingesta de archivos desde el disco.

D es incorrecta: El fuerte y propósito principal de LlamaIndex no es estructurar e indexar manuales de texto plano en tablas relacionales de bases de datos SQL tradicionales manteniendo claves foráneas, sino estructurar la información en formatos jerárquicos o vectoriales amigables para los LLMs.

La respuesta correcta es la B.

¿Por qué es la opción B?  
El problema expone el clásico desafío de la fragmentación de datos (M×N integraciones). Si tienes múltiples fuentes (Slack, GitHub, SQL, Drive, Jira) y múltiples agentes, tradicionalmente necesitas programar una capa de conexión personalizada para cada cruce, lo cual no es escalable.

El Model Context Protocol (MCP) soluciona esto introduciendo una arquitectura estándar Cliente-Host (o Servidor):

En lugar de construir integraciones de punto a punto (1 a 1), cada fuente de datos expone un Servidor MCP unificado.

Cualquier aplicación o agente que funcione como un Cliente MCP (como Claude Desktop, arquitecturas de LangChain especializadas, etc.) puede conectarse de forma nativa e inmediata a cualquiera de estos servidores utilizando el mismo protocolo estándar.

Al proporcionar este estándar universal, los agentes pueden leer repositorios, consultar bases de datos o revisar hilos de chat sin que el equipo de desarrollo deba reescribir código de integración a medida para cada fuente.

Análisis de las opciones incorrectas:  
A es incorrecta: MCP no es un motor de base de datos ni crea una base vectorial federada física; es un protocolo de comunicación en tiempo de ejecución para el intercambio de contexto y herramientas.

C es incorrecta: Aunque crear microservicios con APIs REST ayuda a desacoplar sistemas, no resuelve el problema de la falta de un estándar semántico global. Seguirías requiriendo que cada agente aprenda a mapear los formatos de los endpoints estructurados (JSON) de forma manual y personalizada para cada una de las 5 APIs REST individuales.

D es incorrecta: Un adaptador LoRA se utiliza para modificar sutilmente las capacidades lingüísticas o el estilo de un modelo mediante Fine-Tuning; no sirve para mapear de forma dinámica o conectarse a APIs externas de infraestructura viva en producción.

La respuesta correcta es la D.

¿Por qué es la opción D?  
El problema describe un fallo de orden lógico en la ejecución de tareas dentro del framework CrewAI. El agente "Redactor" no puede empezar a escribir si todavía no cuenta con los datos que el "Investigador" debe recolectar, ya que su entrada depende directamente de la salida del primero.

En CrewAI, el tipo de proceso por defecto y el adecuado para resolver esta dependencia lineal es el Proceso Secuencial (Sequential Process):

Garantiza que las tareas asignadas a la tripulación (Crew) se ejecuten estrictamente una después de la otra, en el orden exacto en el que fueron definidas en el código.

El resultado o la salida generada por la tarea del agente "Investigador" se pasa automáticamente como contexto de entrada para la tarea del agente "Redactor", asegurando que este último tenga toda la información lista antes de comenzar a escribir.

Análisis de las opciones incorrectas:  
A y B son incorrectas: Configurar un proceso asíncrono o paralelo causaría que ambos agentes inicien sus tareas al mismo tiempo de forma independiente. Esto es justamente lo que está provocando el error actual: el redactor arranca en paralelo sin esperar a que existan datos recopilados.

C es incorrecta: Un proceso aleatorio seleccionaría el orden de ejecución al azar, lo cual destruiría la predictibilidad del flujo de trabajo y no solucionaría la dependencia obligatoria de que la investigación ocurra siempre primero.

La respuesta correcta es la A.

¿Por qué es la opción A?  
El escenario describe una dinámica de colaboración que requiere un bucle de retroalimentación o reintento: el Agente C (revisor) debe poder devolver el flujo hacia el Agente B (programador) si se detecta un error en el código, repitiendo este paso hasta que el código sea correcto.

Una Cadena Secuencial (Sequential Chain) tradicional falla en este caso porque está diseñada bajo una estructura estrictamente lineal e inflexible (Paso 1→ Paso 2→ Paso 3). Las cadenas secuenciales no permiten retroceder a pasos anteriores ni tomar decisiones dinámicas en el camino.

Para solucionar esto:

Se requiere un Grafo cíclico (como los construidos con LangGraph).

Los grafos permiten conectar nodos en cualquier dirección e implementar aristas condicionales (conditional edges).

Una arista condicional evalúa el veredicto del Agente C: si es "aprobado", el flujo avanza al final; si es "rechazado", el grafo redirige el flujo de vuelta al Agente B de forma cíclica.

Análisis de las opciones incorrectas:  
B es incorrecta: Aunque la memoria es crucial para que el Agente B recuerde los comentarios de corrección, la persistencia no soluciona el problema de que una cadena secuencial prohíbe físicamente dar saltos o retornos lógicos hacia atrás en el código.

C es incorrecta: Una cadena paralela ejecuta tareas simultáneamente (al mismo tiempo). Esto no sirve aquí, ya que el revisor (C) necesita obligatoriamente esperar a que el programador (B) termine de escribir el código.

D es incorrecta: Un solo agente con ReAct es excelente para usar herramientas externas de forma iterativa, pero delegar tres roles tan complejos y especializados (planear, codificar y revisar) en un único prompt monolítico eleva drásticamente la tasa de fallos y disminuye la calidad de la supervisión.

La respuesta correcta es la D.

¿Por qué es la opción D?  
El escenario describe el clásico antipatrón de diseño conocido como acoplamiento fuerte (tight coupling). Si el código fuente de la aplicación llama directamente a los métodos específicos del SDK de un proveedor (por ejemplo, importando from openai import OpenAI y usando configuraciones de respuesta rígidas en todos los archivos de tu sistema), cambiar de proveedor exige reescribir y refactorizar casi todo el software.

El error arquitectónico directo es la Falta de Abstracción:

Las buenas prácticas de ingeniería dictan que la lógica de negocio de la aplicación debe estar completamente separada de los detalles de infraestructura de los proveedores de IA.

Esto se logra implementando una capa intermedia de abstracción (utilizando patrones de diseño como el Adapter Pattern o frameworks de orquestación como LangChain, LlamaIndex o parches universales como LiteLLM).

Con una capa de abstracción adecuada, tu aplicación llama a una interfaz estándar genérica (model.predict()), y el cambio de OpenAI a Google Gemini se realiza modificando únicamente una línea en un archivo de configuración o variable de entorno, logrando una migración inmediata y ágil.

Análisis de las opciones incorrectas:  
A es incorrecta: Los tokenizadores de OpenAI y Google Gemini tienen vocabularios muy distintos, pero esto es manejado internamente de forma automática por las APIs de cada proveedor a nivel de servidor. El programador solo envía texto plano y recibe texto plano, por lo que la diferencia de tokenizadores no frena el desarrollo de código o la migración del backend.

B es incorrecta: Docker ayuda a empaquetar software y resolver discrepancias de entorno local frente a producción, pero no soluciona el código interno. Si tu código fuente está amarrado sintácticamente a las funciones de OpenAI, la contenerización no va a reescribir mágicamente esas funciones para adaptarlas a la API de Google.

C es incorrecta: Al consumir modelos fundacionales a través de APIs de nivel empresarial en la nube (como las de OpenAI o Google Cloud Vertex AI), el cómputo en servidores remotos e infraestructura física de silicio (GPUs o TPUs) es administrado en su totalidad por el proveedor; tu aplicación solo interactúa mediante solicitudes HTTP estándar.

La respuesta correcta es la D.

¿Por qué es la opción D?  
En los frameworks estándar de evaluación de sistemas RAG (como Ragas o TruLens), el proceso de generación aumentada se divide en dos componentes independientes que se miden con métricas específicas: el Retriever (Recuperador) y el Generator (El LLM).

La métrica Context Recall (Recuperación de Contexto) evalúa exclusivamente el desempeño del Retriever:

Mide si el sistema fue capaz de encontrar todos los documentos reales necesarios que contienen la respuesta correcta basándose en la verdad estandarizada (Ground Truth).

Un puntaje muy bajo (0.2/1.0) significa que de cada 5 fragmentos clave de información que se necesitaban para responder la pregunta, el Retriever solo encontró 1, fallando en traer el contexto relevante de la base de datos vectorial.

El hecho de que la métrica de Recall falle no significa que el LLM esté respondiendo mal; de hecho, la opción especifica correctamente que el LLM responde fielmente (probablemente usando la poca información que le llegó o su propio conocimiento interno), pero el origen del problema está en la mala recolección de los datos de soporte.

Análisis de las opciones incorrectas:  
A es incorrecta: Cuando el LLM alucina inventando respuestas que no existen en el contexto provisto, la métrica que cae a puntajes bajos es la Faithfulness (Fidelidad) o Groundedness, no el Context Recall.

B es incorrecta: Un prompt restrictivo afectará la estructura, tono o libertad creativa del modelo (afectando métricas como Answer Relevance), pero no tiene control directo sobre la cantidad física de documentos que el motor de búsqueda indexa y extrae desde la base vectorial.

C es incorrecta: Si el formato del chunking fuera ilegible (por ejemplo, caracteres rotos), el modelo fallaría de forma catastrófica al procesar el texto o arrojaría errores semánticos generales, pero el Context Recall mide la presencia o ausencia de los documentos objetivos en el arreglo de recuperación, no su limpieza de caracteres.

La respuesta correcta es la D.

¿Por qué es la opción D?  
El escenario describe una contradicción directa entre la respuesta generada por el LLM y la información real contenida en los documentos recuperados. Es decir, el modelo está inventando hechos o alterando los datos provistos en el contexto (está alucinando), a pesar de que formalmente redacta con buena fluidez y tono.

En el framework de evaluación RAGAS, la métrica encargada de medir este comportamiento específico es Faithfulness (Fidelidad):

Esta métrica evalúa la consistencia fáctica del texto generado comparándolo estrictamente contra el contexto recuperado.

Revisa cada enunciado o afirmación de la respuesta y calcula la proporción de estas afirmaciones que pueden ser respaldadas directamente por los documentos de soporte.

Si la respuesta contradice al documento o añade información libre no verificable, el puntaje de Faithfulness cae drásticamente hacia cero.

Análisis de las opciones incorrectas:  
A es incorrecta: Context Recall mide si el motor de búsqueda (Retriever) logró o no encontrar la información necesaria en la base de datos basándose en una respuesta ideal esperada. No mide si el LLM fue fiel a lo recuperado.

B es incorrecta: Context Precision evalúa si los fragmentos de información verdaderamente relevantes quedaron ordenados al principio de los resultados devueltos por el recuperador (relación señal/ruido).

C es incorrecta: Answer Relevance evalúa si la respuesta del LLM es directa y atiende específicamente lo que el usuario preguntó, penalizando respuestas redundantes o incompletas, pero no valida si la información provista es verídica o inventada frente al contexto.

La respuesta correcta es la A.

¿Por qué es la opción A?  
El escenario describe una falla metodológica grave en la validación de sistemas de IA: las preguntas exactas que se diseñaron para evaluar al modelo (Test Set) se incluyeron por error dentro de los documentos de conocimiento que el agente consulta en su base de datos RAG en producción.

Este fenómeno se conoce rigurosamente como Data Contamination (Contaminación de Datos):

Ocurre cuando la información del conjunto de evaluación "se filtra" hacia el entorno que el modelo puede ver, recordar o consultar para responder.

Al estar "contaminado", el puntaje del test (98%) es una métrica artificial y engañosa. El agente no está demostrando que sabe razonar o generalizar ante preguntas del mundo real; simplemente está "haciendo trampa" al tener acceso directo a la hoja de respuestas exactas dentro de sus propios archivos indexados. Por esta razón, cuando en producción llega una pregunta ligeramente diferente, el truco se rompe y el sistema falla estrepitosamente.

Análisis de las opciones incorrectas:  
B es incorrecta: El Overfitting (Sobreajuste) es un concepto puramente estadístico del entrenamiento de redes neuronales, donde los pesos matemáticos del modelo memorizan el Training Set y fallan en el Test Set. Aquí el problema no es matemático, sino que el Test Set físico quedó copiado de forma accidental dentro de la base documental del RAG.

C es incorrecta: El Underfitting (Subajuste) ocurre cuando un modelo es demasiado simple y ni siquiera puede aprender los patrones del conjunto de datos de entrenamiento, obteniendo puntajes bajos desde el principio.

D es incorrecta: La Alucinación se refiere a la tendencia de un LLM a inventar hechos plausibles pero falsos debido a limitaciones en su entrenamiento probabilístico. El problema descrito aquí es de arquitectura e ingeniería de datos (aislamiento de datasets), no una falla lingüística nativa del modelo.

La respuesta correcta es la D.

¿Por qué es la opción D?  
El escenario describe el proceso de depuración de un agente con capacidades de codificación (un Code Interpreter o un agente ReAct que genera scripts). Al activar herramientas de observabilidad como LangSmith o el modo verbose=True/debug=True, el desarrollador obtiene acceso al arreglo de Intermediate Steps (Pasos Intermedios).

En un bucle de ejecución de código, los pasos intermedios capturan el ciclo exacto de acción y reacción del agente:

El Traceback del error: Si el código generado falla en el entorno de ejecución (por ejemplo, un error de sintaxis, NameError, o IndexError), la consola del sistema captura el error técnico y lo inyecta como una observación en los Intermediate Steps.

El intento de auto-corrección: El agente lee ese Traceback en su siguiente iteración de razonamiento (pensamiento/acción) y lo utiliza para entender qué falló, reescribir las líneas de código defectuosas e intentar ejecutar la solución corregida nuevamente. Revisar esta traza específica es fundamental para diagnosticar si el agente está atrapado en un bucle infinito o si sus herramientas de cómputo están mal configuradas.

Análisis de las opciones incorrectas:  
A es incorrecta: Los embeddings del input se calculan al inicio de una consulta en la base de datos vectorial para recuperar documentos. No aparecen en la traza de pasos intermedios de ejecución de código de un intérprete de Python.

B es incorrecta: La temperatura y la semilla (Seed) son hiperparámetros de configuración fijos que envías en el payload al inicializar la llamada a la API del LLM, no datos dinámicos que se extraigan de la salida de ejecución de código intermedio.

C es incorrecta: El uso de tokens (Token Usage) es una métrica de telemetría e infraestructura útil para calcular costos y límites de cuota, pero no te proporciona información lógica sobre por qué un script de Python arrojó un error en tiempo de ejecución.

La respuesta correcta es la C.

¿Por qué es la opción C?  
El escenario describe un problema clásico en la depuración de aplicaciones basadas en Modelos de Lenguaje: la falta de determinismo. Debido a la naturaleza probabilística de las redes neuronales transformer, por defecto, el modelo utiliza un muestreo estocástico para seleccionar el siguiente token, lo que significa que ante un mismo input exacto puede generar salidas diferentes en cada intento, provocando fallas intermitentes (un Heisenbug).

Para forzar la reproducibilidad matemática y hacer que el bug sea predecible en tu entorno local, se deben ajustar dos configuraciones clave en la API:

Temperature \= 0: Reduce la aleatoriedad al mínimo. Obliga al modelo a elegir siempre el token con la probabilidad matemática más alta (búsqueda codiciosa o greedy search).

Fijar Seed (Semilla): Los proveedores de LLM (como OpenAI) exponen un parámetro de semilla para inicializar el generador de números aleatorios del sistema operativo de sus servidores de forma idéntica. Si fijas un número entero constante en el parámetro seed y mantienes la temperatura en 0, el backend del modelo devolverá outputs idénticos palabra por palabra en cada ejecución, eliminando la variabilidad y permitiéndote atrapar el bug.

Análisis de las opciones incorrectas:  
A es incorrecta: Cambiar a un modelo más potente como GPT-4 puede modificar las capacidades generales de razonamiento del sistema o enmascarar temporalmente el error si maneja mejor la instrucción, pero no elimina la naturaleza estocástica del muestreo si se mantiene una temperatura variable; el comportamiento no reproducible persistirá.

B es incorrecta: Aumentar el nivel de Logging a Verbose es excelente para recolectar telemetría e información adicional en los archivos de texto de la consola, pero es una herramienta de observación pasiva. No tiene la capacidad de intervenir en los cálculos matemáticos de la API para alterar o congelar el comportamiento del LLM.

D es incorrecta: Limpiar la caché vectorial ayuda si sospechas de una corrupción física en la persistencia o indexación del almacenamiento en disco, pero no influye en la variabilidad probabilística intermitente del texto de salida generado por la red neuronal.

La respuesta correcta es la A.

¿Por qué es la opción A?  
El enunciado describe la configuración estándar para medir la exactitud del resultado final de un sistema de IA generativa. Cuando utilizas un framework de evaluación basado en un LLM-as-a-judge (un modelo evaluador) para contrastar directamente la respuesta generada por tu agente contra una respuesta ideal de referencia (Ground Truth) redactada por expertos humanos, estás midiendo la Correctness (Exactitud semántica).

Correctness: Evalúa qué tan alineada está la respuesta del sistema con la verdad absoluta del negocio. El LLM evaluador analiza de forma semántica si se cubrieron los mismos puntos clave, si hay contradicciones o si se omitió información esencial frente a la plantilla ideal proporcionada.

Análisis de las opciones incorrectas:  
B es incorrecta: La Latencia es una métrica de rendimiento de infraestructura técnica que mide el tiempo físico (en segundos o milisegundos) que tarda el servidor en responder; no requiere comparar textos semánticos contra expertos humanos.

C es incorrecta: Faithfulness (Fidelidad al contexto) no compara la salida contra una respuesta ideal de expertos; en su lugar, compara la respuesta del LLM contra los documentos crudos recuperados por el RAG para asegurar que el modelo no esté inventando información (alucinando).

D es incorrecta: Context Recall evalúa exclusivamente el motor de búsqueda (Retriever) verificando si los fragmentos extraídos de la base de datos vectorial coinciden con la información que se debió haber extraído, sin juzgar la redacción de la respuesta final. El mismo examen ya marca esta opción explícilmente como "Incorrecta".

La respuesta correcta es la B.

¿Por qué es la opción B?  
El problema enfatiza tres condiciones clave: las preguntas son altamente repetitivas, el LLM actual ya responde con excelente calidad, pero los costos son altos y la latencia es de 3 segundos. El negocio exige la solución arquitectónica más eficiente para optimizar la relación Costos/Latencia como prioridad inicial.

La estrategia ideal para este patrón de tráfico es implementar Semantic Caching (Caché Semántica) (utilizando herramientas como GPTCache o Redis Vector Store):

A diferencia de una caché tradicional basada en texto exacto, la caché semántica utiliza embeddings para evaluar la similitud de la nueva pregunta frente a un histórico de preguntas ya respondidas y guardadas en una base de datos local rápida.

Si un usuario pregunta "¿A qué hora abren la sucursal?" y la caché ya guardó la respuesta para "¿Cuál es el horario de atención?", el sistema detecta que el significado semántico es idéntico.

El sistema devuelve la respuesta almacenada inmediatamente desde la caché sin consumir un solo token del LLM remoto, lo que reduce los costos a $0 para esa consulta y baja la latencia de 3 segundos a unos pocos milisegundos.

Análisis de las opciones incorrectas:  
A es incorrecta: Realizar Fine-Tuning para destilar un modelo más pequeño requiere un esfuerzo masivo de ingeniería: recopilar miles de ejemplos limpios, pagar el entrenamiento del modelo y mantener el despliegue de una infraestructura propia dedicada de GPUs. Sigue requiriendo cómputo para cada pregunta y no es la primera opción óptima o ágil.

C es incorrecta: La cuantización a 4-bit disminuye el tamaño en memoria RAM del modelo y acelera sutilmente la inferencia en entornos locales autohospedados, pero degrada la calidad lingüística del modelo y no previene que sigas procesando iterativamente miles de preguntas idénticas una y otra vez.

D es incorrecta: Configurar Streaming (recibir la respuesta palabra por palabra en tiempo real) es una excelente práctica de diseño para mejorar la UX y la "percepción" de velocidad del usuario, pero no reduce los costos económicos de los tokens consumidos en la API ni soluciona la ineficiencia de procesar repetidamente la misma consulta en el backend.

La respuesta correcta es la B.

¿Por qué es la opción B?  
El comportamiento descrito (un pico masivo de 500 llamadas en solo 2 minutos para resolver una única consulta de usuario) es el síntoma clásico de un bucle infinito en agentes autónomos (comúnmente llamado un Agent Loop o Runaway Agent).

En arquitecturas agénticas basadas en el patrón ReAct (Reasoning and Acting) u orquestadas con herramientas como LangChain o LangGraph:

El agente evalúa una tarea, decide llamar a una herramienta, observa el resultado y decide qué hacer a continuación de forma iterativa.

Si ocurre un error lógico en su workflow (por ejemplo, la herramienta devuelve un formato inesperado que el LLM no entiende, o el prompt del sistema no es lo suficientemente claro), el agente puede quedarse atrapado intentando ejecutar una y otra vez la misma acción o herramienta de forma recursiva, consumiendo tokens de la API a máxima velocidad sin llegar jamás al estado de parada ("Final Answer").

Para prevenir esto en producción, es obligatorio configurar siempre límites de contención como un parámetro de max\_iterations (por ejemplo, limitar a un máximo de 10 o 15 iteraciones por consulta) para romper el bucle automáticamente si el agente se descontrola.

Análisis de las opciones incorrectas:  
A es incorrecta: Un ataque de Prompt Injection puede intentar secuestrar las directrices del modelo para que ignore sus reglas de seguridad o extraiga datos sensibles, pero no tiene la capacidad de manipular la infraestructura del framework de backend para duplicar peticiones de manera recursiva a nivel de red a esa velocidad.

C es incorrecta: Una temperatura muy alta incrementa la creatividad y aleatoriedad del modelo, lo que podría provocar que el agente falle al parsear o alucina, pero la temperatura por sí misma no dispara llamadas HTTP automáticas recursivas hacia OpenAI a menos que la lógica del orquestador de software se lo permita mediante un bucle.

D es incorrecta: Un Top-K excesivo inunda el contexto de la llamada con demasiados documentos, lo que incrementará de golpe el costo por token de una sola llamada específica y elevará la latencia, pero no causa que el agente realice 500 llamadas independientes en ráfaga para una sola pregunta.

La respuesta correcta es la C.

¿Por qué es la opción C?  
El escenario describe un incidente crítico de seguridad corporativa y reputación de marca provocado por un ataque de Jailbreak exitoso (donde un usuario malintencionado logra saltarse las barreras éticas del modelo mediante prompts manipulados). Al tratarse de una entidad bancaria, la prioridad máxima ante una crisis pública en redes sociales es la contención inmediata del riesgo, seguida de un proceso estructurado de remediación.

El protocolo estándar de ingeniería y gobernanza ante esta crisis sigue rigurosamente estos pasos:

Activar "Kill Switch" (Botón de apagado): Se desactiva o pausa el agente de inmediato en todos los canales públicos para frenar en seco la generación de más respuestas extremistas o dañinas mientras dure la emergencia.

Analizar forense: Se revisan los logs detallados del sistema de observabilidad para auditar el prompt exacto del atacante, identificar la vulnerabilidad lingüística explotada y entender cómo se vulneraron las capas de seguridad.

Parchear: Se corrigen las vulnerabilidades implementando barreras robustas (ej. guardrails dedicados como NeMo Guardrails o Llama Guard, clasificadores de entrada/salida y parches en el prompt de sistema).

Comunicar: Una vez mitigado el fallo técnico en su totalidad, la organización emite una postura oficial transparente y corporativa sobre el control del incidente.

Análisis de las opciones incorrectas:  
A es incorrecta: El Adversarial Training (entrenamiento adversarial) es un proceso de fine-tuning masivo sumamente lento que requiere recolectar datos de ataque y reentrenar/ajustar los pesos de una red neuronal. No es viable ni lógico realizarlo "de forma inmediata" en medio de una crisis en vivo con el sistema generando respuestas en producción.

B es incorrecta: Culpar vagamente a las "alucinaciones" es metodológicamente falso (un jailbreak es una falla de alineación de seguridad por entrada maliciosa, no una simple alucinación de datos) y representa una pésima estrategia de comunicación corporativa que evade la responsabilidad técnica.

D es incorrecta: Modificar silenciosamente el System Prompt bloqueando palabras clave (enfoque de lista negra o blacklist) es una solución superficial e ingenua. Los atacantes que realizan jailbreaks evaden fácilmente el bloqueo de palabras mediante técnicas de ofuscación, traducción o codificación de texto, lo que mantendría el sistema expuesto y vulnerable mientras sigue encendido.

La respuesta correcta es la D.

¿Por qué es la opción D?  
El escenario plantea un problema de optimización de costos ante solicitudes redundantes: procesar 50,000 veces la misma noticia popular generó un gasto masivo e innecesario de $10,000 USD.

Para evitar este desperdicio masivo de cómputo y dinero, el componente arquitectónico que faltó es el Caching Semántico (Semantic Caching):

Cuando la primera consulta solicita información sobre la noticia, el sistema llama al LLM, genera la respuesta y la almacena en una base de datos local (caché) indexada mediante vectores (embeddings).

Para las 49,999 peticiones restantes que buscan exactamente lo mismo o variaciones semánticamente equivalentes de la misma pregunta, el sistema intercepta la consulta y sirve la respuesta guardada inmediatamente desde la caché.

Esto intercepta el tráfico antes de que llegue al proveedor de IA, reduciendo el costo de esas 49,999 llamadas a $0 y evitando por completo el desperdicio financiero.

Análisis de las opciones incorrectas:  
A es incorrecta: Un Límite de presupuesto simplemente apagaría el servicio por completo cuando se alcance el dinero estipulado, dejando a los usuarios sin respuestas y deteniendo la aplicación en producción. No previene la ineficiencia subyacente.

B es incorrecta: Un Rate Limiter restringe el número de peticiones por segundo para evitar ataques de denegación de servicio (DoS) o abusos, pero si 50,000 usuarios legítimos entran de forma orgánica a lo largo del día a ver la noticia popular, el limitador de tasa no solucionará el costo acumulado de procesar los mismos tokens una y otra vez.

C es incorrecta: La Prompt Compression ayuda a reducir el tamaño del contexto de entrada eliminando tokens redundantes, lo que bajaría marginalmente el costo por llamada individual. Sin embargo, multiplicar una llamada optimizada por 50,000 ejecuciones idénticas seguirá generando un desperdicio masivo que solo se mitiga evitando la llamada al LLM.  
