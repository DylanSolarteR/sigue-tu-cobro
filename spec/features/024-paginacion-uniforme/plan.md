# 024 · Paginación uniforme — Plan

## Enfoque

Implementar primero pruebas de la lógica de ventanas de página y de la condición de medición. Después crear un componente compartido y un hook de medición/sincronización, integrarlos con las cinco superficies existentes y cubrir los recorridos con Playwright en escritorio y móvil.

## Diseño técnico

1. Revisar cómo cada listado y el selector existente almacenan página, tamaño, conteo, filtros y selección. Mantener su estado fuente y evitar una segunda fuente de verdad para las dos posiciones del control.
2. Extraer una función pura que calcule las páginas visibles según el total y la página actual. Debe tratar correctamente primera, media y última páginas, totales pequeños, límites y entradas acotadas.
3. Crear un componente reutilizable que reciba la entidad/etiqueta, posición, página actual, total de páginas y callbacks de navegación. Los controles superior e inferior se renderizan como instancias accesibles del mismo componente y comparten el estado controlado por el padre.
4. Crear un hook o mecanismo local para medir el contenedor de resultados, excluyendo las barras de paginación. Usar `ResizeObserver` para cambios de contenido y un listener de ventana `resize`; limpiar ambos al desmontar. Evitar actualizar estado cuando el resultado booleano no cambió.
5. Recalcular con datos filtrados/paginados y expansiones mediante cambios observables del contenedor; comprobar reflow y desmontaje. El criterio compara la altura medida de contenido visible con `window.innerHeight`.
6. Integrar sin cambiar page sizes (10 cuentas, 10 clientes/acreedores, 25 ítems), conteos, selección, filtros o bloqueos. Revisar los casos en los que un filtro reduce el número de páginas para mantener la página dentro del rango existente.
7. Conservar el sidebar y añadir pruebas de regresión para su orden en escritorio y móvil.

## Secuencia TDD y validación

1. Escribir tests unitarios de páginas visibles: 1/2, centro, últimas páginas, totales menores, flechas en extremos y rangos inválidos.
2. Escribir tests del hook/componente para una o dos barras, visibilidad superior, medición excluyendo paginación, `ResizeObserver`, `resize`, actualización al cambiar contenido y sincronización de acciones.
3. Ejecutar esas pruebas y confirmar fallos esperados antes de implementar.
4. Implementar el cálculo puro, control compartido y medición; integrar cada superficie, corriendo las pruebas dirigidas entre pasos.
5. Añadir o adaptar Playwright para ambos viewports con datos simulados. Cuando las barras duplicadas estén presentes, usar `getByRole('navigation', { name: ... })` y scopes explícitos para obtener botones dentro de la navegación superior o inferior.
6. Verificar visualmente la alineación móvil/escritorio, alturas de 44 px, estilos de estado, foco sin rings/outlines externos, contraste mínimo de 4.5:1, conteos y orden de sidebar. Usar directamente `--color-primary` y `--color-primary-content`; no depender de la clase heredada `bg-primary`.
7. Ejecutar suites de regresión, `pnpm run check` y `pnpm run build`; anotar comandos y resultados reales en tasks, README y roadmap. No marcar evidencia que no se haya obtenido.

## Límites y decisiones

- Sin cambios de base de datos, datos, DDL ni dependencias.
- No reabrir ni alterar la restauración histórica de 023.
- Las barras superior e inferior son proyecciones del mismo estado actual de página; las etiquetas accesibles incluyen entidad y posición para desambiguar E2E.
- La regla de aparición superior se determina por el alto del contenedor de resultados sin barras, comparado con la altura de ventana.

## Resultado

Implementación y validación completadas. Pasaron 243 pruebas en 50 archivos, 61 pruebas de regresión dirigida en 6 archivos tras el ajuste de contraste, E2E afectado con 31 aprobadas y un skip de pulsación sostenida solo en desktop, más seis E2E de retest para color/foco en desktop y móvil. El check final terminó con cero errores/avisos y tipos; el build de producción pasó. Las capturas finales se revisaron en escritorio y móvil. No se ejecutó un benchmark nuevo.
