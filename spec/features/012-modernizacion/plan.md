# 012 · Modernización — Plan

## Orden acordado

1. Pruebas y base técnica: Vitest y Playwright, pruebas iniciales y actualización gradual de dependencias. La feature 011 contiene el detalle de pruebas.
2. [Flujo de cobro](../013-flujo-cobro-items/spec.md): ítems previos, selección por cliente, estados, cálculos y adaptación del PDF y resumen.
3. Identidad y componentes: conservar los colores actuales como punto de partida, sustituir shadcn por daisyUI y rediseñar la landing, las páginas de acceso de Clerk y la estructura visual completa del dashboard. Descartar las disposiciones actuales del dashboard y el login.
4. Experiencia y adaptación: reducir pasos, simplificar el cambio de estado y verificar los recorridos en móvil, tableta y escritorio. Complementar la feature 010.
5. Validación final: ejecutar E2E con servicios simulados, revisar lint y tipos, y preparar la restauración histórica mediante snapshot protegido, transformación y transacción controlada. La restauración se ejecutó según [023](../023-restauracion-historicos/plan.md); la concurrencia real queda fuera de alcance.

Antes de cada etapa se detallarán su spec, plan, tareas y criterios verificables; se desarrollará y revisará por separado. La actualización de dependencias exige comprobar versiones y compatibilidades antes de instalarlas.

## Decisiones del flujo

Los ítems pertenecen a un cliente y usuario. Solo se seleccionan ítems pendientes del cliente elegido; al generar una cuenta pasan a added y al marcarla pagada a paid. Reabrir una cuenta pagada los devuelve a added. Los ítems de cuentas pendientes se pueden editar actualizando el total; en cuentas pagadas se requiere reabrir antes. Al eliminar una cuenta pendiente se desvinculan y vuelven a pending.

La migración debe conservar el historial y adaptar el valor histórico payed. Proteger las escrituras por propietario y asegurar la asignación de ítems frente a operaciones concurrentes. Diseñar y ensayar la migración y su recuperación antes de aplicarla.

## Verificación

TDD por funcionalidad; validar dominio y componentes con Vitest, recorridos críticos con Playwright y servicios de prueba aislados, además de pruebas de migración, aislamiento entre usuarios, concurrencia, PDF, accesibilidad y responsive. No almacenar credenciales en el repositorio.

La etapa 021 completó los E2E con mocks y la 022 resolvió el lint global. La etapa 023 restauró el historial en `v2` y verificó el resultado con una conexión nueva; la evidencia y límites se registran en su feature.

El usuario excluyó de esta secuencia las pruebas con servicios reales y hará por separado la revisión en dispositivos físicos y el despliegue. El orden original anterior se conserva como contexto; el seguimiento vigente es el roadmap consolidado.
