# 023 · Restauración de datos históricos

**Estado:** restauración real aplicada en las tres tablas `v2`, con `COMMIT` verificado por conexión nueva y validación CLI posterior aprobada. Snapshot de `v1` y sus tablas originales permanecen sin cambios según comparación de SHA-256 antes/después. Build, check estricto, tipos, 229 pruebas y PDF con datos preparados pasaron. La revisión visual manual del PDF no se realizó. No se validaron Clerk real, concurrencia real ni despliegue.

## Objetivo

Restaurar en las tres tablas `v2` los datos actuales de las tablas históricas `v1`, capturados en un nuevo snapshot privado local. Las tres tablas `v1` permanecerán intactas. La operación sustituirá exclusivamente los registros de prueba actuales en `v2`, conservando IDs, montos, relaciones, actividad y fechas salvo las conversiones definidas aquí.

## Fuente y estado de referencia

- Fuente aprobada: snapshot nuevo de solo lectura de las tablas `v1` actuales, creado localmente sin modificar esas tablas. Preparación y huella registradas en el reporte privado externo al repositorio.
- Conteos auditados de referencia en `v1`: 22 actores, 88 cuentas y 341 ítems (451 registros en total). Si una nueva lectura difiere, detenerse y explicar la diferencia antes de cargar.
- Conteos observados en tablas `v2` de prueba que se reemplazarían: 3 actores, 2 cuentas y 7 ítems (12 registros). Reconfirmar inmediatamente antes de aplicar.
- El respaldo local `C:/Dev/SigueTuCobro/backups/singlestore-2026-11-09T22-54-36-663Z.sql` con SHA-256 `0E8423278320E5FB00D4320FE7AB406645892406BB2FC2B9ABA664C2C64B1CDD` se conserva intacto como archivo previo, pero no es la fuente de esta restauración.
- Snapshot, artefactos intermedios y reporte son privados locales bajo `../backups`, fuera de todos los worktrees Git. No copiarlos al repositorio ni registrar datos personales en documentación o logs.

## Alcance funcional y transformación

- Capturar DDL y registros de las tablas `v1` actuales mediante lectura; el snapshot y hash deben permitir identificar exactamente la fuente preparada. No modificar `v1`.
- No ejecutar ningún dump, DDL, `db:push` ni migraciones sobre una base. Para snapshots SQL, usar un parser acotado con whitelist de sentencias/columnas. Rechazar sintaxis no admitida; no usar `eval` ni ejecutar SQL extraído. El CLI permite leer respaldos SQL offline mediante `--source <archivo-SQL>`.
- Transformar el estado histórico de cuenta `payed` a `paid`.
- Cada ítem histórico toma el cliente desde su cuenta: pasa a `paid` si la cuenta está `paid` (incluido `payed` tras normalizarlo), o a `added` si está `pending`.
- Para `pay_date`, convertir el timestamp a día civil de Colombia (`America/Bogota`) y guardarlo como `YYYY-MM-DD`. Conservar las demás fechas como vienen, junto con IDs, montos, actividad y referencias.
- Generar artefactos intermedios locales y privados que permitan revisar conteos, relaciones, conversiones y diferencias sin exponer datos personales.
- Crear un PDF con datos históricos restaurados y validar automatizadamente su contenido. Una revisión visual manual no se declara realizada.

## Criterios de aceptación

- [x] El snapshot nuevo de `v1` se generó sin escrituras y su hash, DDL y conteos quedaron registrados fuera del repositorio; la auditoría coincidió con 22 actores, 88 cuentas y 341 ítems.
- [x] Los conteos previos en `v2` fueron 3 actores, 2 cuentas y 7 ítems; quedaron respaldados antes de sustituirlos.
- [x] La inspección no ejecuta el dump ni sentencias DDL; el parser offline aplica la whitelist, rechaza entradas no permitidas y no evalúa código dinámico.
- [x] La conversión conserva los campos especificados y aplica el mapeo de estados, cliente y `pay_date` colombiano; cubierto por las pruebas locales.
- [x] Las pruebas unitarias y de regresión cubren parser, conversiones, fallos de transacción y privacidad; 229 pruebas en 49 archivos y `pnpm run check` pasaron.
- [x] Antes de aplicar, el usuario confirmó escrituras detenidas y cuota >40.
- [x] Se obtuvo un respaldo local y privado del estado actual de las tres tablas `v2` inmediatamente antes del reemplazo.
- [x] El reemplazo afectó exclusivamente las tres tablas `v2`, en una sola conexión y transacción con comparación previa al `COMMIT`; pruebas cubren rollback ante errores.
- [x] El `COMMIT` se verificó con conexión nueva; la verificación CLI aprobó y las tablas `v1` mantuvieron su hash SHA-256 original.
- [x] La validación automatizada del PDF con datos preparados, `check`, 229 pruebas, tipos y build pasaron. No hubo inspección visual manual del PDF.
- [x] Las tareas y el roadmap registran evidencia y límites; no se declara validación de Clerk real, concurrencia real ni despliegue.

## Fuera de alcance

No se probaron servicios reales de Clerk ni concurrencia real de SingleStore; no se desplegó. Los artefactos locales privados no se publican ni se versionan.
