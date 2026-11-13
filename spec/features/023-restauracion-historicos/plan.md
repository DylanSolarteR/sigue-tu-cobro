# 023 · Restauración de datos históricos — Plan

## Secuencia

1. Confirmar que la fuente es el estado actual de `v1`, sin modificarlo. La CLI acepta `pnpm run data:restore inspect|prepare --source legacy-live|<archivo-SQL> --out <ruta>`; la lectura live requiere `--maintenance`. Guardar `--out` bajo `../backups` y comprobar que la ruta resuelta queda fuera de todos los repositorios/worktrees Git. Mantener intacto el respaldo del 9 de noviembre como archivo histórico, no como fuente de esta carga.
2. Comprobar esquema, conteos y hash del snapshot. Los conteos de referencia son 22 actores, 88 cuentas y 341 ítems (451); detenerse y reconciliar diferencias. Registrar también los conteos presentes en `v2` (3 actores, 2 cuentas y 7 ítems) y volver a verificarlos antes de reemplazarlos.
3. Para respaldos SQL offline, usar `--source <archivo-SQL>` con parser de alcance limitado: consumir `CREATE` y `SET` solo para lectura, ignorar DDL, y aceptar únicamente valores `INSERT` de tablas/columnas en whitelist. Rechazar instrucciones y sintaxis no admitidas. No ejecutar el archivo con motor SQL, `eval`, DDL, `db:push` o migraciones.
4. Validar la representación de origen: auditar claves, relaciones, valores de estado, fechas, montos y actividad. Detenerse ante datos inválidos o diferencias no explicadas; reportar sin datos personales.
5. Convertir al esquema `v2`: cuenta `payed` → `paid`; cliente del ítem tomado de la cuenta; estado del ítem `paid` cuando su cuenta está pagada y `added` cuando está `pending`; `pay_date` a día civil `America/Bogota` en `YYYY-MM-DD`. Mantener iguales las demás fechas, IDs, montos, actividad y referencias. Producir reporte privado con conteos y diffs no sensibles.
6. Escribir primero pruebas unitarias y de regresión para fuentes, parser permitido/rechazado, entradas corruptas, conteos, relaciones, mapeos de estado y fechas de borde alrededor de medianoche Colombia, preservación de campos e invariantes. Añadir regresión del flujo vigente y del PDF histórico.
7. Preparar el procedimiento de carga con comparación completa del conjunto destino antes del commit. La CLI usa `pnpm run data:restore apply --prepared <DIR> --expected-hash <SHA> --maintenance --expect-database <NOMBRE> --out <snapshot-v2-privado>`. Guardar `--out` bajo `../backups` y comprobar que su ruta resuelta queda fuera de todos los repositorios/worktrees. El procedimiento usa una conexión y transacción: `DELETE` e inserciones solo en las tres tablas `v2`; una discrepancia o error implica `ROLLBACK`. No reintentar un `COMMIT` de resultado incierto.
8. Antes de la operación real, exigir confirmación explícita del usuario de que las escrituras están detenidas y verificar cuota disponible >40 para esta operación. Si las condiciones cambian o el trabajo se interrumpe, detenerse y consultar antes de continuar.
9. Respaldar localmente el contenido actual de `v2`, ejecutar la carga y comparar cada registro contra la preparación antes de `COMMIT`. Tras commit, abrir conexión nueva y verificar conteos, campos y relaciones. Ante error conocido, hacer rollback; ante commit incierto, no reintentar y consultar estado con conexión nueva.
10. Verificar con `pnpm run data:restore verify --prepared <DIR> --expected-hash <SHA>` y una conexión nueva, luego generar el PDF histórico y validar su contenido automáticamente. Ejecutar `pnpm run check`, suites unitarias/regresión y build; registrar evidencia concreta en tareas y roadmap. No afirmar pruebas con Clerk real, concurrencia real ni despliegue.

## Límites y decisiones

- Fuente actual: tablas `v1` leídas sin escrituras. La restauración no altera `v1`.
- El respaldo fechado el 9 de noviembre se conserva intacto y no alimentó este reemplazo. El CLI lee respaldos offline con `--source <archivo-SQL>`.
- La fuente y artefactos de preparación se guardan bajo `../backups`, fuera de todos los worktrees y del control de versiones.
- Alcance de escritura restringido a las tres tablas `v2`.
- No se inicia la aplicación hasta confirmar escrituras detenidas y cuota superior a 40.
- Un resultado de commit incierto se investiga; nunca se repite a ciegas.
- La restauración se completó: snapshot `v1` capturado/auditado, transacción aplicada y verificada por conexión nueva, prueba CLI adicional aprobada y hash del origen idéntico antes/después. Ver resultados resumidos en [tareas](tasks.md).
- No se probaron Clerk real, concurrencia real de SingleStore ni despliegue.
