# Rendimiento observado

Fecha: 11 de noviembre de 2026. Chromium 158.0.8127.18, servidor Next optimizado y local, un worker de Playwright. Escritorio: 1440 × 1000. Móvil: emulación Pixel 7 sobre el mismo equipo, sin limitación de CPU ni red; no representa un teléfono físico.

Se ejecutaron cinco muestras tras un calentamiento, sin otras suites ni builds simultáneos. Los tiempos son observados por Playwright e incluyen su acción, esperas de comprobación y dos frames de estabilización. El backend simulado usa fixtures en memoria, persistidos localmente e invalidados al cambiar el archivo. No se mide SingleStore ni Clerk reales.

## Medianas finales (milisegundos)

| Vista | Cuentas / pendientes por cliente | Listado listo | Filtro | Paginación | Selección | Editor | Ítems listos | Creación lista | Resumen listo |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Escritorio | 1.000 / 100 | 242 | 63 | 116 | 102 | 131 | 302 | 308 | 354 |
| Escritorio | 10.000 / 1.000 | 423 | 68 | 101 | 119 | 134 | 318 | 321 | 1.649 |
| Móvil emulado | 1.000 / 100 | 208 | 50 | 101 | 101 | 118 | 235 | 290 | 272 |
| Móvil emulado | 10.000 / 1.000 | 386 | 66 | 100 | 101 | 134 | 235 | 299 | 1.569 |

Pasaron los objetivos locales de mediana: carga hasta 3 segundos e interacción hasta 500 ms. `performance-results.json` conserva las cinco muestras y el peor resultado de cada medición, la versión del navegador y los máximos de nodos, tareas largas y CLS por ruta.

## Comportamiento con volumen

- Se recorrieron los últimos registros de ambos conjuntos y se abrió la última cuenta filtrada. La lista de cuentas mantiene 10 filas por página.
- Ambas listas de pendientes muestran 25 ítems por página. Con 1.000 pendientes, ítems mantuvo 316 nodos y la creación 253, frente a 7.136 y 4.148 nodos iniciales respectivamente.
- Se comprobó que la selección de conceptos y el total sobreviven al cambio de página, y que las acciones por lotes conservan la selección de cuentas entre páginas.
- Se descargó un PDF con datos editados y otro de 100 conceptos, de varias páginas. Los PDFs se generan bajo demanda.
- No se detectó desbordamiento horizontal. La pulsación sostenida se ejecutó con eventos táctiles de Chromium en el proyecto móvil.
- En las muestras finales, las mayores tareas largas fueron 68 ms en cuentas y 57 ms en creación; el CLS máximo observado fue 0,00565. No son mediciones de campo ni un resultado de Core Web Vitals.

## Interpretación y pendientes

La línea base inicial incluye generación anticipada de PDFs, listas completas de pendientes y lecturas reiteradas del archivo de fixtures. Como el harness también se optimizó, la diferencia de tiempos no debe atribuirse enteramente a cambios del producto. La disminución de nodos sí corresponde a la paginación.

Los datos de 10.000 cuentas aún se cargan completos y se filtran/paginan en el cliente. Estos resultados verifican esta escala local, pero no establecen capacidad con más usuarios, latencia real, móviles físicos o grandes cargas simultáneas. La autenticación de Clerk, la persistencia/concurrencia real y los ensayos de migración/restauración conservan su validación independiente.
