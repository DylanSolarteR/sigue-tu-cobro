# 013 · Flujo de cobro por ítems — Tareas

- [ ] Inventariar esquema, flujo actual y consistencia de datos sin alterar la base.
- [ ] Diseñar y ensayar la migración y su recuperación en una base aislada.
- [ ] Escribir pruebas de dominio, autorización, transiciones y concurrencia antes de implementar.
- [ ] Implementar esquema, operaciones y selección atómica de ítems por cliente.
- [ ] Adaptar formularios, acciones rápidas, PDF y resumen.
- [ ] Verificar migración, pruebas automatizadas, tipos y build; registrar evidencia.
- [ ] Actualizar criterios y roadmap; ejecutar E2E y revisar lint al final de las etapas de lógica y UI/UX.

## Avance de implementación

Se prepararon el nuevo flujo, pruebas de dominio y componentes, y un borrador de migración. La migración, la recuperación y la concurrencia siguen sin ensayarse; se verificarán en la etapa final después de los cambios de interfaz.

Por decisión posterior se creó un respaldo SQL local de las tres tablas originales y se crearon vacías las tablas `stc_actor_table_v2`, `stc_billing_statement_table_v2` y `stc_billing_statement_item_table_v2`. Las originales no fueron alteradas y el código de esta rama apunta a v2. Dos lecturas consecutivas del respaldo coincidieron, pero no garantizan una instantánea atómica ni se ha ensayado su restauración. Las tablas comparten el mismo workspace y no constituyen aislamiento de infraestructura. Los ensayos y el traslado de datos históricos quedan pendientes; no ejecutar el borrador de backfill hasta revisarlo para los nombres v2.

La suite completa pasó 88 pruebas, incluyendo generación de un PDF real, comprobación de contenido, pruebas del enlace de descarga y manejo de fechas en distintos husos. Las fechas nuevas se guardan como día civil `YYYY-MM-DD`; los timestamps históricos se interpretan en `America/Bogota`, conforme a la decisión del usuario. Las pruebas de base usan simulaciones: no demuestran concurrencia ni aislamiento reales en SingleStore. La descarga real en navegador sigue pendiente para E2E.
