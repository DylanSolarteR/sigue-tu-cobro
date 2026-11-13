# 019 · Controles y secciones coherentes

**Estado:** implementado; pendiente de revisión visual.

## Alcance

Respetar los cambios manuales existentes; normalizar secciones, selects personalizados accesibles con búsqueda de clientes y acreedores, skeletons redondeados, anchuras flexibles y foco de campos mediante borde. Actualizar los elementos antiguos además de los nuevos y simplificar etiquetas de ítems.

## Validación prevista

Probar teclado, búsqueda, selección, estados vacíos y deshabilitados; revisar skeletons, edición de ítems y responsive. Ejecutar linter, pruebas, tipos y build. E2E y ensayos de datos se mantienen aplazados.

La suite pasa con 165 pruebas, el build y la comprobación de tipos. El lint global conserva errores previos: 64 en la base comparada y 62 en el worktree, además de 23 advertencias en cada uno. El tamaño `text-stc-label` y el color `text-stc-text` son utilidades distintas. La revisión visual y táctil está pendiente.
