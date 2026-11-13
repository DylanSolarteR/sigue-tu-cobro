# 013 · Preparación de migración de datos — borrador reemplazado

> **Obsoleto y no ejecutable.** Este procedimiento se conserva como historial de decisiones; quedó reemplazado por [023 · Restauración de datos históricos](../023-restauracion-historicos/spec.md). No ejecutar `migracion-v013.borrador.sql`, `auditoria.sql` ni `validacion-v013.sql` como procedimiento de restauración. La etapa 023 prepara una carga controlada en `v2`; no ejecuta dump ni DDL.

**Estado: borrador sin ensayar; no autorizado para ejecutar.** Los SQL de esta carpeta no son migraciones Drizzle ejecutables. No ejecutar `db:push`, `db:migrate` ni estos borradores sobre datos reales con esta propuesta. La entrega de la aplicación depende de probar y completar el procedimiento en un entorno aislado.

## Evidencia de origen

El 9 de noviembre de 2026, `SHOW CREATE TABLE` en el workspace configurado mostró tablas columnstore, con `billing_statement_id NOT NULL` y enum de cuenta `payed`/`pending`. Una auditoría agregada de solo lectura encontró 340 ítems y 87 cuentas, sin huérfanos, diferencias de propietario, actores inválidos ni totales distintos de la suma de ítems activos. Son datos puntuales: repetir la auditoría inmediatamente antes del cambio y con escrituras detenidas.

SingleStore no permite alterar la nulabilidad ni los valores de enum con `MODIFY` en columnstore; además, el DDL puede confirmar de forma implícita y no ser reversible con `ROLLBACK`. Por ello el borrador crea tablas de preparación con el esquema deseado en vez de alterar el esquema original. Referencias: [ALTER TABLE](https://docs.singlestore.com/cloud/reference/sql-reference/data-definition-language-ddl/alter-table/), [tipos ENUM](https://docs.singlestore.com/cloud/reference/sql-reference/data-types/other-types/).

## Ensayo aislado y controles

1. Preparar una base aislada con el mismo tipo de despliegue y versión. Crear fixtures que incluyan cuentas `pending` y `payed`, activas e inactivas, ítems activos e inactivos, cuentas sin ítems y casos deliberadamente inconsistentes. No usar datos reales sin autorización explícita.
2. Ejecutar `auditoria.sql`; la presencia de cualquier discrepancia detiene el proceso para investigación, incluso diferencias de totales. El script de carga usa `JOIN`, por lo que sin esta verificación podría omitir ítems huérfanos.
3. Verificar un respaldo completo y una restauración ensayada, detener escrituras y acceso de la aplicación, y confirmar que no existan las tablas de preparación o respaldo. DDL no equivale a una transacción: registrar cada paso exitoso y detenerse ante cualquier fallo.
4. Con las escrituras detenidas, ejecutar en el entorno aislado `migracion-v013.borrador.sql` y después `validacion-v013.sql`. Este último compara conteos y campos de origen y destino, incluida la transformación `payed` → `paid`, y todos sus resultados deben ser cero. Probar además los casos de datos inconsistentes y fallo intermedio.
5. Diseñar y ensayar un procedimiento explícito de intercambio de ambas tablas y recuperación, incluyendo interrupciones entre renombres, índices, permisos, dependencias y comprobaciones funcionales. El borrador no contiene renombres ni instrucciones de borrado: no se asume que el intercambio de dos tablas sea atómico.
6. Validar la versión final de migración con el esquema Drizzle resultante y acordar cómo se registrará en su historial. Como no hay historial versionado previo en el repositorio, no generar ni aplicar ciegamente una migración que intente crear de nuevo las tablas existentes.

## Semántica y recuperación

Todos los ítems existentes, incluidos los inactivos y los de cuentas inactivas, conservan su cuenta y propietario; se toma el cliente de la cuenta y se asigna `paid` si su cuenta estaba `payed`, o `added` si estaba `pending`. Se mantienen importes, fechas y demás campos. No se crean ítems `pending` durante el backfill histórico.

Antes del intercambio, ante errores, detenerse y conservar tanto las tablas originales como las de preparación para diagnóstico. Tras el intercambio, restaurar desde el respaldo verificado o ejecutar el procedimiento de reversión ensayado, según el punto exacto del fallo. Un simple `ROLLBACK` no revierte estos cambios DDL. Si ya hubo escrituras en el esquema nuevo, volver a las tablas viejas puede perderlas: se requiere reconciliación y una decisión expresa; nunca descartar esas escrituras automáticamente.
