# 023 · Restauración de datos históricos — Tareas

## Preparación, aplicación y verificación

- [x] Capturar y auditar snapshot privado de solo lectura de `v1`: 22 actores, 88 cuentas y 341 ítems.
- [x] Validar whitelist/parser, conversiones, conteos, relaciones, montos, estados y fechas; preservar IDs, actividad y demás fechas.
- [x] Confirmar escrituras detenidas y cuota disponible >40 para la operación.
- [x] Respaldar las tres tablas `v2` existentes antes de reemplazarlas.
- [x] Reemplazar solo las tres tablas `v2` mediante una única conexión/transacción, con comparación previa a `COMMIT` y rollback cubierto por pruebas.
- [x] Verificar el `COMMIT` con conexión nueva y pasar `data:restore verify`.
- [x] Releer `v1` y confirmar que DDL y datos permanecen intactos mediante coincidencia de SHA-256 antes/después.
- [x] Generar y validar automáticamente el PDF con datos históricos preparados.
- [x] Ejecutar regresión (229 pruebas en 49 archivos), `pnpm run check` (cero errores/avisos y tipos) y build de producción.
- [x] Actualizar README, roadmap y listas relacionadas con la evidencia real.

## Evidencia

- Snapshot privado bajo `../backups/restauracion-v2-2026-11-13/prepared`, fuera de todos los worktrees: `legacy-source.sql`, SHA-256 `cda9df4c12b3cc7a59a8dd9f681d329909d752840039d598c3797453420af6b3`.
- Huella de conversión: `f4ff4fb2b9f12ae9c0b4f9fb664b2274c5bf4cb865b96e18a7390f10fe45551d`.
- Tras la restauración, `v2` contiene 22 actores, 88 cuentas y 341 ítems: 77 cuentas `pending`, 11 `paid`; 286 ítems `added`, 55 `paid`. Suma de cuentas e ítems activos: 1.266.913.496 COP; suma de todos los ítems: 1.271.698.161 COP.
- El respaldo previo de `v2` conserva el estado de prueba de 3 actores, 2 cuentas y 7 ítems; su huella es `330ab326f738a866ab4b5eb0963d55e27da4040c9b2fbd1ca2ab2e3d40156dee`.
- `data:restore verify` confirmó coincidencia del conjunto preparado; el snapshot posterior de `v1` tuvo exactamente el mismo SHA-256 que el original.
- PDF validado automáticamente con datos preparados: `../backups/restauracion-v2-2026-11-13/prepared/evidence/historical-account.pdf`.

## Límites

La revisión visual manual del PDF no se realizó. No se probaron Clerk real, concurrencia real de SingleStore ni despliegue. La persistencia real de esta restauración sí se comprobó mediante la transacción y verificación con conexión nueva.
