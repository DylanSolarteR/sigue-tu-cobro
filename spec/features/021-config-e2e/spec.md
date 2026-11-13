# 021 · Configuración, navegador y rendimiento

**Estado:** implementado y validado con servicios simulados.

## Objetivo

Extender el perfil de Clerk al ancho disponible y verificar los recorridos del producto en escritorio y móvil con Playwright, incluyendo PDF y grandes conjuntos de datos.

## Criterios de aceptación

- Configuración solicita ancho completo mediante la API pública de Clerk y cuenta con un contenedor centrado como alternativa.
- Los recorridos cubren directorio, ítems, creación/edición de cuentas, filtros, paginación, lotes, estados vacíos, errores, teclado y selección táctil.
- Se descarga un PDF real y otro de 100 conceptos, con varias páginas.
- Los conjuntos de 1.000 cuentas/100 pendientes y 10.000 cuentas/1.000 pendientes no desbordan la ventana y permiten acceder a los registros finales.
- Se recogen cinco muestras tras un calentamiento, con mediana y peor caso, tareas largas, CLS y tamaño del DOM. Objetivos locales: cargas con mediana de hasta 3 s e interacciones de hasta 500 ms.
- Pasan las pruebas, tipos y el build final sin mocks.

## Validación final

Pasaron 179 pruebas de lógica/componentes y 31 pruebas de navegador; una prueba táctil se omite solo en escritorio y pasa en móvil. Pasaron tipos y build de producción. Se inspeccionaron capturas de volumen en escritorio y móvil y se verificó ausencia de la API simulada y del perfil falso en el artefacto de producción. El control de fixtures devolvió 404 en la instancia local de producción, usando `localhost` conforme a la configuración de desarrollo de Clerk.

## Límites y aislamiento

El harness sustituye Clerk y el punto de entrada del backend; las acciones y sus validaciones siguen siendo reales. El estado se guarda exclusivamente en `.next-e2e/fixtures.json` y se reinicia antes de cada prueba. La identidad autorizada se guarda en un archivo de entorno local ignorado; el resto de los datos son ficticios. Las mediciones incluyen el coste del transporte y almacenamiento local de fixtures y no representan la capacidad de SingleStore ni la latencia de Clerk. El perfil simulado permite comprobar el contenedor, pero no valida las funciones internas del perfil real.

La conexión real aborta si se importa durante E2E, el servidor recibe parámetros de conexión inutilizables y el comando de producción rechaza los flags de mocks. El control local de fixtures exige un token temporal, host local y modo E2E; fuera de ese modo responde 404.

## Hallazgos y cambios derivados

La descarga previa combinaba controles interactivos y no inició una descarga en uno de los recorridos. La generación anticipada de PDFs bloqueaba la apertura del editor: las medianas iniciales fueron 1.266 ms y 5.980 ms. El PDF ahora se consulta y genera únicamente al solicitarlo, mediante una descarga de Blob.

El editor obtiene cuenta e ítems mediante `getBillingStatementDetails(id)`, una acción que valida el identificador y devuelve un Result conjunto, ejecutando ambas consultas en paralelo en el servidor. También se evita validar fechas masivamente cuando no hay filtros de fechas activos. Las consultas reales siguen sujetas a la autorización de sus routers.

Con 1.000 pendientes, la vista de ítems alcanzó 7.136 nodos y una tarea larga de 226 ms. Ambas listas de pendientes se paginan a 25 elementos; la selección y el total se conservan entre páginas.

El harness terminó usando una caché en memoria invalidada por modificación del archivo de fixtures. La línea base inicial releía el archivo completo en cada consulta; por ello sus tiempos sirven como registro de hallazgos y no como comparación aislada de mejoras de la aplicación. Las métricas finales y sus condiciones se conservan en `performance-results.json` y se interpretan en `performance.md`.

Durante la preparación del harness, cuatro actores ficticios llegaron a la base real antes de corregir la resolución de aliases. Se identificaron por sus IDs, propietario, nombres, documento y horas exactas del intento; se retiraron y se comprobó que no quedaban. Se añadieron pruebas del bloqueo de base real y de producción para evitar repetir ese fallo. El respaldo de esos registros queda solo en un archivo local ignorado.
