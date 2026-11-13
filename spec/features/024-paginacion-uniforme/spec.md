# 024 · Paginación uniforme

## Estado

**Estado:** implementada y validada. La lista detallada de evidencia está en [tasks](tasks.md). La ejecución E2E incluyó una omisión de pulsación sostenida solo para desktop; mobile pasó. No se ejecutó un benchmark nuevo.

## Objetivo

Unificar la navegación entre páginas de cuentas de cobro, clientes, acreedores e ítems. Hacer que los resultados largos puedan recorrerse desde arriba y desde abajo sin perder los tamaños de página, los filtros ni el estado de selección ya existentes.

## Alcance

- Reutilizar un control compartido de paginación en listados de cuentas, clientes, acreedores e ítems.
- Usar el mismo control en el selector de ítems del flujo de creación de cuenta.
- Mostrar números de página seleccionables y flechas Lucide `ChevronLeft` y `ChevronRight`.
- Conservar las reglas de página actuales: 10 cuentas, 10 actores (clientes/acreedores) y 25 ítems.
- Mantener los conteos visibles ya existentes.
- Permitir un control al pie y, cuando el contenido visible sobrepase la altura de la ventana, un control superior sincronizado.
- Mantener el orden de navegación del sidebar en escritorio y móvil: Resumen, Ítems, Cuentas de cobro, Directorio, Configuración.

## Comportamiento

1. Ocultar los controles de paginación si existe una sola página o ninguna.
2. Mostrar solo números de página existentes: primera página (`1 2`), páginas intermedias (`19 20 21`) y últimas páginas (`29 30`). La página actual y las vecinas inmediatas son las únicas que aparecen; si hay menos páginas, mostrar las disponibles.
3. Cada número cambia directamente a esa página. La página activa usa el color primario verde oscuro.
4. Las flechas anterior y siguiente cambian una página. La flecha anterior se deshabilita en la primera página y la siguiente se deshabilita en la última.
5. Mostrar la paginación inferior al final de los resultados: centrada en móvil y alineada a la derecha en escritorio.
6. Mostrar una copia superior alineada a la derecha solo cuando la altura del contenido de resultados visible supere `window.innerHeight`. La medición excluye ambos controles de paginación.
7. Medir el bloque de resultados con `ResizeObserver` y actualizar la decisión también ante `resize` de ventana, filtrado, cambio de página, expansión de filas y reflow responsive. No crear ciclos de medición por incluir la altura de los propios controles.
8. Cuando existan ambos controles, cualquier cambio de página desde uno actualiza de inmediato el otro y el contenido.
9. Mantener el indicador de conteo de ítems visibles existente.
10. Al cambiar filtros, preservar las reglas actuales de reset/clamp de página y de selección; evitar páginas fuera del nuevo rango.

## Presentación y accesibilidad

- Aplicar el patrón visual de `ICON_ACTION_CLASS`: botones redondeados `rounded-xl`, de 44 px, tipografía global de 14 px y fondos/estados definidos con tokens globales.
- En hover, usar el token de superficie `stc` de hover. Comunicar el foco de teclado mediante el borde de foco del sistema, sin rings ni outlines externos.
- Los botones de número deben exponer el estado actual con `aria-current="page"`; los controles deshabilitados deben usar el atributo nativo `disabled`.
- Cada conjunto debe ser una navegación etiquetada con el nombre de entidad y su posición, por ejemplo «Paginación de cuentas, superior» y «Paginación de cuentas, inferior». Para el selector de ítems, usar un nombre que lo distinga del listado general de ítems.
- Las flechas deben tener nombre accesible contextual («Página anterior» / «Página siguiente»). No depender solo del icono ni del color para comunicar el estado.
- Mantener navegación por teclado, contraste y estados visibles en temas y tamaños soportados.

## Criterios de aceptación

- [x] Los cuatro listados y el selector de ítems usan la misma implementación reutilizable y exponen el número de página actual.
- [x] Con una sola página no se muestra ningún control; con varias páginas se muestran solamente la página actual, vecinas existentes y límites según los ejemplos y reglas anteriores.
- [x] Los números navegan directamente; las flechas avanzan/retroceden una página y los extremos se deshabilitan correctamente.
- [x] Los tamaños existentes (10 cuentas, 10 actores, 25 ítems), conteos, filtros, selección y bloqueos del flujo se conservan.
- [x] En contenido que excede la ventana aparece una paginación superior a la derecha; al caber en la ventana solo queda la inferior.
- [x] La medición sigue respondiendo al cambio de tamaño, filtros, página, expansión de filas y reflow; la altura de la paginación no altera el umbral.
- [x] Cuando hay dos controles, ambos muestran el mismo estado y ejecutar una acción en cualquiera produce un único cambio coherente de resultados.
- [x] El control cumple los tamaños, tokens visuales, foco y atributos/nombres accesibles especificados.
- [x] Playwright verifica escritorio y móvil con datos simulados; el harness identifica los controles por su etiqueta accesible y posición para evitar selectores ambiguos por duplicación.
- [x] Pasan pruebas unitarias del cálculo de límites y pruebas del hook/componente para sincronía, condiciones de visibilidad y actualización de mediciones; pasan check, suites de regresión y build.
- [x] La suite completa conserva el orden del sidebar Resumen, Ítems, Cuentas de cobro, Directorio, Configuración en escritorio y móvil.

## Fuera de alcance

No se modifican datos, esquema, DDL, consultas del backend, tamaños de página actuales ni la restauración histórica cerrada en 023. No se altera el comportamiento de filtros, selección o bloqueos salvo para conservarlos durante la navegación.
