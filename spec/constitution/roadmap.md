# Roadmap

Este índice refleja evidencia de código y el TODO del README; su numeración organiza la documentación y no representa una cronología comprobada.

## Implementado en código; validación pendiente

1. [001 · Datos y acceso](../features/001-datos-y-acceso/spec.md) — esquema, conexión, autenticación y aislamiento parcial.
2. [002 · Portada y acceso](../features/002-portada-y-acceso/spec.md) — landing y pantallas de autenticación.
3. [003 · Resumen del panel](../features/003-resumen-panel/spec.md) — indicadores y navegación.
4. [004 · Clientes y acreedores](../features/004-clientes-acreedores/spec.md) — listado y gestión de actores.
5. [005 · Cuentas e ítems](../features/005-cuentas-items/spec.md) — creación, edición, eliminación lógica y detalle.
6. [006 · PDF de cuenta](../features/006-pdf/spec.md) — generación del documento.
7. [007 · Configuración de cuenta](../features/007-configuracion/spec.md) — perfil de usuario.
8. [008 · Despliegue y revisión manual](../features/008-despliegue-revision/spec.md) — declarado completado en README, sin comprobación independiente.

## Pendiente según README

- [009 · Página 404](../features/009-pagina-404/spec.md).
- [010 · Adaptación responsive](../features/010-responsive/spec.md).
- [011 · Pruebas automatizadas](../features/011-pruebas-automatizadas/spec.md): base de pruebas implementada; E2E y lint aplazados hasta después de lógica y UI/UX.

No se asigna prioridad entre pendientes porque el README no la establece.

## Modernización acordada

- [012 · Modernización](../features/012-modernizacion/spec.md): base técnica y flujo implementados; siguen identidad y componentes, experiencia adaptable y una etapa final para E2E, lint y ensayos de datos.
- [013 · Flujo de cobro por ítems](../features/013-flujo-cobro-items/spec.md): implementado con pruebas locales; validación real de concurrencia y migración de datos diferidas a la etapa final.
- [014 · Identidad e interfaz](../features/014-identidad-interfaz/spec.md): rediseño y revisión visual realizados; quedan ajustes que el usuario detallará y dependencias heredadas por retirar.
- [015 · Experiencia y adaptación](../features/015-experiencia-adaptable/spec.md): ajustes de portada y acceso, renovación de vistas operativas, selección y filtros de cuentas, analíticas acordadas y skeletons. E2E, lint global y ensayos de datos siguen diferidos a la etapa final.
- [016 · Pulido de cuentas y resumen](../features/016-pulido-cuentas-resumen/spec.md): revisión visual de cuentas, calendario e importes, evolución por fecha prevista y ranking de clientes con cuentas pagadas; pendiente de revisión visual del usuario.
- [017 · Sistema visual e ítems](../features/017-sistema-e-items/spec.md): tokens compartidos, toasts, valores interactivos de la gráfica y rediseño de ítems; pendiente de revisión visual del usuario.
- [018 · Flujo de ítems y cuentas](../features/018-flujo-items-cuentas/spec.md): secciones y filas expandibles de ítems, creación de cuentas y botón uniforme; pendiente de revisión visual.
