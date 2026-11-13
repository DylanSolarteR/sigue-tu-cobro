# 024 · Paginación uniforme — Tareas

## Preparación y pruebas primero

- [x] Identificar los cinco puntos de integración y documentar estado actual de páginas, tamaños, conteos, filtros, selección y bloqueos.
- [x] Añadir pruebas unitarias para el cálculo de páginas visibles: primera, media, última, totales pequeños y extremos.
- [x] Añadir pruebas para botones anterior/siguiente, estado deshabilitado, selección directa de página y `aria-current="page"`.
- [x] Añadir pruebas del hook/componente para visibilidad/duplicación, medición sin barras, `ResizeObserver`, `resize`, reflow, actualización por filtros/expansión y sincronización.
- [x] Ejecutar pruebas nuevas antes de implementar y registrar el fallo esperado.

## Implementación

- [x] Implementar la función compartida para construir la ventana de páginas con entradas delimitadas.
- [x] Implementar el control reutilizable conforme a `ICON_ACTION_CLASS`, tokens globales, flechas Lucide y requisitos accesibles.
- [x] Implementar medición del contenedor de resultados con `ResizeObserver` y evento `resize`, excluyendo barras de paginación.
- [x] Integrar cuentas y verificar 10 resultados por página.
- [x] Integrar clientes y acreedores y verificar 10 resultados por página.
- [x] Integrar listados y selector de ítems y verificar 25 resultados por página.
- [x] Conservar conteos visibles, filtros, selección y bloqueos; ajustar/clamp de página cuando cambie el total filtrado.
- [x] Asegurar dos controles sincronizados solo cuando el contenedor de resultados supera la altura de la ventana.
- [x] Verificar orden del sidebar Resumen, Ítems, Cuentas de cobro, Directorio, Configuración en escritorio y móvil.
- [x] Revisar visualmente altura de 44 px, radio de 12 px, tipografía de 14 px y foco sin outline.
- [x] Verificar en retest que el color seleccionado usa las variables CSS del tema y alcanza contraste de 4.5:1.

## Verificación

- [x] Añadir E2E de paginación y regresión con servicios simulados para desktop y mobile; identificar cada navegación por etiqueta y posición.
- [x] Inspeccionar capturas desktop/mobile para alineación, controles duplicados, estados y desbordes.
- [x] Ejecutar suites de pruebas unitarias, componentes y regresión E2E pertinentes; registrar comandos y resultados.
- [x] Ejecutar `pnpm run check`; registrar evidencia real.
- [x] Repetir E2E de foco/color y regresión dirigida después del ajuste de contraste.
- [x] Ejecutar `pnpm run build`; registrar evidencia real.
- [x] Actualizar DESIGN, README, índice SDD, roadmap y listas relacionadas con los resultados; mantener pendientes los criterios no verificados.

## Evidencia

### Implementación y verificación finales

- TDD inicial: fallaron las pruebas de paginación ausente y orden anterior del sidebar; tras la implementación, 14 pruebas de paginación/sidebar pasaron (11 de paginación y 3 de sidebar).
- Otro grupo de integración reportó 6 fallos esperados y 41 pruebas aprobadas antes de integrar. Después, 47 pruebas en 4 archivos pasaron.
- La implementación reportada reutiliza `Pagination`/`PaginatedList` y un adaptador para el selector de ítems. El `ResizeObserver` observa únicamente las filas y además responde a `resize`; se preserva el foco del control inferior al ocultarse el superior. Los números exponen `aria-current` y las navegaciones tienen etiquetas por entidad y posición.
- La suite integrada reportó 243 pruebas aprobadas en 50 archivos. La regresión dirigida posterior al ajuste pasó 61 pruebas en 6 archivos. El check final pasó con cero errores/avisos y tipos, y el build de producción pasó.
- El E2E afectado reportó 31 pruebas aprobadas y una omisión de pulsación sostenida solo en desktop; mobile pasó. Incluyó seis pruebas nuevas de paginación. Tras el arreglo de color/foco, pasaron seis E2E de retest en desktop y móvil, con aserciones del token y contraste mínimo de 4.5:1. Estos seis retests son cobertura repetida y no casos únicos adicionales.
- El helper E2E por página, entidad y posición resuelve las barras duplicadas. En la prueba de rendimiento solo se adaptaron selectores para `aria-current`; no se ejecutó un benchmark nuevo.
- La revisión de capturas comprobó altura de 44 px, radio de 12 px, tipografía de 14 px y foco sin outline. Detectó que la clase heredada `bg-primary` causaba fondo oscuro e ilegible. El ajuste usa directamente `--color-primary` y `--color-primary-content` y añade una aserción de token y contraste mínimo 4.5:1.
- Las capturas finales se revisaron en desktop y móvil; se comprobó el verde profesional `#319678`, contraste legible, radio de 12 px, tipografía de 14 px, área de 44 px y orden del sidebar. También se revisaron páginas completas de Directorio móvil y Crear cuenta desktop.
- No se hicieron escrituras de base de datos. No se ejecutó benchmark nuevo ni E2E con servicios reales.
