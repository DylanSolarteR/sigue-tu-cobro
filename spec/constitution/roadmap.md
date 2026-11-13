# Roadmap

Estado consolidado de la modernización. Las validaciones automáticas abarcan lógica, componentes y navegador con servicios simulados; no equivalen a validar Clerk o SingleStore reales.

## Implementado y cubierto por evidencia local

- [002 · Portada y acceso](../features/002-portada-y-acceso/spec.md), [003 · Resumen](../features/003-resumen-panel/spec.md), [004 · Directorio](../features/004-clientes-acreedores/spec.md), [005 · Cuentas e ítems](../features/005-cuentas-items/spec.md), [006 · PDF](../features/006-pdf/spec.md) y [007 · Configuración](../features/007-configuracion/spec.md): implementados. La evidencia actual se concentra en las etapas 013–021; las funciones internas reales de Clerk no se incluyen en los E2E simulados.
- [009 · Página 404](../features/009-pagina-404/spec.md): implementada: 180 pruebas de regresión, 6 E2E dirigidos, tipos y build aprobados. Capturas inspeccionadas en escritorio y móvil emulado.
- [010 · Responsive](../features/010-responsive/spec.md): layouts adaptados y recorridos probados en escritorio y móvil emulado. La revisión en dispositivos físicos corresponde al usuario.
- [011 · Pruebas](../features/011-pruebas-automatizadas/spec.md): Vitest y Playwright operativos, con descargas de PDF, volumen y rendimiento local documentados en [021](../features/021-config-e2e/spec.md).
- [012 · Modernización](../features/012-modernizacion/spec.md): dependencias y base técnica actualizadas; nuevo flujo, identidad, componentes, experiencia, lint global y restauración histórica completados.
- [013 · Flujo por ítems](../features/013-flujo-cobro-items/spec.md): pending → added → paid, selección por cliente, reapertura, desvinculación y PDF implementados. El historial se restauró a `v2` y verificó en la etapa 023.
- [014 · Identidad](../features/014-identidad-interfaz/spec.md) y [015 · Experiencia adaptable](../features/015-experiencia-adaptable/spec.md): landing, acceso y dashboard renovados con daisyUI, controles compartidos, selección, filtros, analíticas y skeletons.
- [016 · Cuentas y resumen](../features/016-pulido-cuentas-resumen/spec.md), [017 · Sistema visual e ítems](../features/017-sistema-e-items/spec.md), [018 · Flujo de ítems y cuentas](../features/018-flujo-items-cuentas/spec.md), [019 · Controles](../features/019-controles/spec.md) y [020 · Directorio](../features/020-directorio/spec.md): implementados y cubiertos por pruebas; la revisión visual final pertenece al usuario.
- [021 · Configuración, E2E y rendimiento](../features/021-config-e2e/spec.md): 179 pruebas de lógica/componentes, 31 E2E aprobadas y una omisión táctil solo en escritorio; tipos y build aprobados. Incluye PDF bajo demanda, pendientes paginados y medidas con hasta 10.000 cuentas y 1.000 pendientes.

- [022 · Lint global](../features/022-lint-global/spec.md): completada; cero errores y cero avisos, tipos, 185 pruebas, 23 E2E afectados y build de producción aprobados.
- [023 · Restauración de datos históricos](../features/023-restauracion-historicos/spec.md): snapshot `v1` auditado (22 actores, 88 cuentas, 341 ítems), transformación y reemplazo de datos de prueba en `v2` aplicados en una transacción y verificados con conexión nueva. Hash del snapshot original y posterior de `v1` coincidieron; check, 229 pruebas y build aprobados. La revisión visual manual del PDF no se realizó. No acredita Clerk real, concurrencia ni despliegue.
- [024 · Paginación uniforme](../features/024-paginacion-uniforme/spec.md): control compartido en cuatro listas y selector de ítems, paginación superior condicional medida sobre filas, accesibilidad y sidebar revisados. Pasaron 243 pruebas en 50 archivos, 61 pruebas dirigidas posteriores al ajuste visual, 31 E2E aprobadas con un skip de pulsación sostenida solo en desktop, seis E2E de retest color/foco, check sin errores/avisos, tipos y build. Capturas desktop/mobile inspeccionadas. No se ejecutó benchmark nuevo; no hubo escrituras de base de datos.

- [025 · README de producto y puesta en marcha](../features/025-readme-produccion/spec.md): README en español con propósito, origen personal, público, funciones y guía de ejecución. Enlaces y comandos verificados; check sin errores ni avisos y 243 pruebas en 50 archivos aprobadas. La entrega resuelve el README del merge hacia `main` y sincroniza `develop`; no repite build ni E2E porque el código no cambió.

## Próximos trabajos, en orden acordado

No queda restauración histórica ni paginación uniforme pendiente en la secuencia acordada. La implementación y la evidencia de 024 están consolidadas en su [especificación y tareas](../features/024-paginacion-uniforme/spec.md). El commit e integración se registran en el cierre de la rama.

En cada implementación se actualizarán este índice, el README y las listas históricas relacionadas con evidencia concreta. El commit e integración de cada cambio se registran en el cierre de su rama.

## Fuera de la secuencia por decisión del usuario

- E2E con servicios reales de Clerk y SingleStore y pruebas de concurrencia/aislamiento. La persistencia de la restauración de la etapa 023 sí está comprobada.
- Revisión en dispositivos físicos: a cargo del usuario; no se declara verificada por emulación.
- [008 · Despliegue](../features/008-despliegue-revision/spec.md): a cargo del usuario.

[001 · Datos y acceso](../features/001-datos-y-acceso/spec.md) y las listas retrospectivas conservan criterios sobre servicios reales e historial que no deben marcarse como verificados solo por pasar mocks. Las exclusiones anteriores se distinguen de los pendientes de implementación.
