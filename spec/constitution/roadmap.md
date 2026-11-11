# Roadmap

Estado consolidado de la modernización. Las validaciones automáticas abarcan lógica, componentes y navegador con servicios simulados; no equivalen a validar Clerk o SingleStore reales.

## Implementado y cubierto por evidencia local

- [002 · Portada y acceso](../features/002-portada-y-acceso/spec.md), [003 · Resumen](../features/003-resumen-panel/spec.md), [004 · Directorio](../features/004-clientes-acreedores/spec.md), [005 · Cuentas e ítems](../features/005-cuentas-items/spec.md), [006 · PDF](../features/006-pdf/spec.md) y [007 · Configuración](../features/007-configuracion/spec.md): implementados. La evidencia actual se concentra en las etapas 013–021; las funciones internas reales de Clerk no se incluyen en los E2E simulados.
- [009 · Página 404](../features/009-pagina-404/spec.md): implementada: 180 pruebas de regresión, 6 E2E dirigidos, tipos y build aprobados. Capturas inspeccionadas en escritorio y móvil emulado.
- [010 · Responsive](../features/010-responsive/spec.md): layouts adaptados y recorridos probados en escritorio y móvil emulado. La revisión en dispositivos físicos corresponde al usuario.
- [011 · Pruebas](../features/011-pruebas-automatizadas/spec.md): Vitest y Playwright operativos, con descargas de PDF, volumen y rendimiento local documentados en [021](../features/021-config-e2e/spec.md).
- [012 · Modernización](../features/012-modernizacion/spec.md): dependencias y base técnica actualizadas; nuevo flujo, identidad, componentes, experiencia y lint global implementados. Queda la restauración histórica indicada abajo.
- [013 · Flujo por ítems](../features/013-flujo-cobro-items/spec.md): pending → added → paid, selección por cliente, reapertura, desvinculación y PDF implementados con pruebas locales. Los datos históricos aún deben restaurarse al formato v2.
- [014 · Identidad](../features/014-identidad-interfaz/spec.md) y [015 · Experiencia adaptable](../features/015-experiencia-adaptable/spec.md): landing, acceso y dashboard renovados con daisyUI, controles compartidos, selección, filtros, analíticas y skeletons.
- [016 · Cuentas y resumen](../features/016-pulido-cuentas-resumen/spec.md), [017 · Sistema visual e ítems](../features/017-sistema-e-items/spec.md), [018 · Flujo de ítems y cuentas](../features/018-flujo-items-cuentas/spec.md), [019 · Controles](../features/019-controles/spec.md) y [020 · Directorio](../features/020-directorio/spec.md): implementados y cubiertos por pruebas; la revisión visual final pertenece al usuario.
- [021 · Configuración, E2E y rendimiento](../features/021-config-e2e/spec.md): 179 pruebas de lógica/componentes, 31 E2E aprobadas y una omisión táctil solo en escritorio; tipos y build aprobados. Incluye PDF bajo demanda, pendientes paginados y medidas con hasta 10.000 cuentas y 1.000 pendientes.

- [022 · Lint global](../features/022-lint-global/spec.md): completada; cero errores y cero avisos, tipos, 185 pruebas, 23 E2E afectados y build de producción aprobados.

## Próximos trabajos, en orden acordado

1. Convertir el respaldo histórico a los formatos v2 y restaurarlo sustituyendo los registros actuales que el usuario creó para pruebas. Preparar antes el inventario, el mapeo de campos/estados/fechas y la comprobación de importes y relaciones. No ejecutar borrados como parte de la etapa 404 o del lint.

En cada implementación se actualizarán este índice, el README y las listas históricas relacionadas.

## Fuera de la secuencia por decisión del usuario

- Pruebas con servicios reales: autenticación y perfil de Clerk, persistencia, concurrencia y aislamiento reales de SingleStore.
- Revisión en dispositivos físicos: a cargo del usuario; no se declara verificada por emulación.
- [008 · Despliegue](../features/008-despliegue-revision/spec.md): a cargo del usuario.

[001 · Datos y acceso](../features/001-datos-y-acceso/spec.md) y las listas retrospectivas conservan criterios sobre servicios reales e historial que no deben marcarse como verificados solo por pasar mocks. Las exclusiones anteriores se distinguen de los pendientes de implementación.
