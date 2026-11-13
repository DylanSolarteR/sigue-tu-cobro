# 025 · README de producto y puesta en marcha

## Estado

**Estado:** documentación completada y verificada; entregada con la resolución del README en el merge de `develop` hacia `main`.

## Objetivo

Reemplazar el README histórico y desactualizado con una presentación en español de SigueTuCobro, explicación honesta de sus capacidades y guía breve para iniciar el proyecto localmente.

## Alcance

- Presentar el público y propósito del producto con voz personal, basada únicamente en el origen autorizado por el usuario.
- Describir el flujo real de directorio, ítems, cuentas y seguimiento, junto con capacidades del panel.
- Resumir el stack observado, requisitos de ejecución, variables de entorno, instalación, desarrollo, comprobaciones, pruebas, build y servidor de producción.
- Enlazar la documentación de producto, diseño y SDD útil para quien quiera continuar el desarrollo.
- Retirar instrucciones obsoletas y afirmaciones no demostradas, como PostgreSQL, estado de pruebas históricamente incompleto o trabajo pendiente ya cerrado.

## Criterios de aceptación

- [x] El README queda en español, centrado en producto y en una voz cercana, sin cifras, testimonios, logos, licencias, URL ni badges inventados.
- [x] La historia de origen se limita a que el padre del autor trabaja de manera independiente en el sector de maquinaria y gestiona cobros a empresas mediante cuentas de cobro.
- [x] Las capacidades y límites reflejan código y especificaciones: clientes/acreedores, ítems, estados, seguimiento manual, acciones masivas sobre cuentas, PDF, analíticas, filtros, paginación, edición y responsive.
- [x] El ranking se describe como clientes ordenados por valor de cuentas pagadas y filtrado por fecha prevista (`pay_date`), sin presentarla como fecha efectiva de pago.
- [x] La guía distingue variables de Clerk y SingleStore, no incluye secretos ni instrucciones de migración/push de esquema.
- [x] Los E2E se describen como simulados, con preparación local de Chromium y limitación explícita: no validan Clerk, base de datos ni servicios reales.
- [x] Comandos y requisitos coinciden con `package.json`, configuración E2E y evidencia disponible; no se afirma que la app esté desplegada.
- [x] El README se mantiene conciso y escaneable.
- [x] Se actualizan el índice SDD y roadmap; el cierre Git se registra en el historial del merge y la sincronización de ramas.

## Fuera de alcance

Cambios de código, esquema, configuración, dependencias, instalaciones, despliegues y afirmaciones de validación de servicios reales.
