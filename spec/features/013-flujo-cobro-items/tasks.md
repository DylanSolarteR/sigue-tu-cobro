# 013 · Flujo de cobro por ítems — Tareas

La implementación del nuevo flujo se documenta como concluida en el roadmap y cuenta con cobertura local. El backfill propuesto aquí quedó sustituido por [023 · Restauración de datos históricos](../023-restauracion-historicos/spec.md), completada con persistencia real verificada.

- [x] Inventariar esquema, flujo actual y consistencia de datos para el nuevo modelo sin alterar la base original.
- [x] Implementar pruebas locales de dominio, transiciones y componentes del flujo.
- [x] Implementar selección por cliente, operaciones de ítems, cálculos y transiciones de estado.
- [x] Adaptar formularios, acciones, PDF y resumen.
- [x] Validar el flujo con pruebas locales, tipos, E2E simulados y build; evidencia consolidada en las etapas del roadmap.
- [x] Actualizar el roadmap y revisar lint global en la etapa 022.
- [x] Restaurar los datos históricos: completado y verificado en 023. Los SQL de 013 son borradores obsoletos y no se ejecutan.

## Avance de implementación

El nuevo flujo se implementó con pruebas locales. La propuesta original de migración y recuperación se retiró; el historial de 013 se conserva como contexto y la restauración vigente se rige por 023.

Como contexto histórico, el 9 de noviembre se guardó un respaldo SQL local que se conserva intacto, pero no alimentó la restauración. La fuente fue un snapshot nuevo de solo lectura de `v1` (22 actores, 88 cuentas, 341 ítems). Las tablas `v2` contenían 3 actores, 2 cuentas y 7 ítems de prueba; fueron reemplazadas y verificadas según [023](../023-restauracion-historicos/spec.md). No ejecutar los borradores SQL de 013.

La suite completa pasó 88 pruebas, incluyendo generación de un PDF real, comprobación de contenido, pruebas del enlace de descarga y manejo de fechas en distintos husos. Las fechas nuevas se guardan como día civil `YYYY-MM-DD`; los timestamps históricos se interpretan en `America/Bogota`, conforme a la decisión del usuario. Las pruebas de base usan simulaciones: no demuestran concurrencia ni aislamiento reales en SingleStore. La descarga real en navegador sigue pendiente para E2E.
