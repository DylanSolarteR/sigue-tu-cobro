# 012 · Modernización — Plan

## Orden acordado

1. Pruebas y base técnica: Vitest y Playwright, pruebas iniciales y actualización gradual de dependencias. La feature 011 contiene el detalle de pruebas.
2. [Flujo de cobro](../013-flujo-cobro-items/spec.md): ítems previos, selección por cliente, estados, cálculos, migración conservadora y adaptación del PDF y resumen.
3. Identidad y componentes: diseñar una identidad clara y confiable, sustituir shadcn por daisyUI, rediseñar la landing y personalizar Clerk.
4. Experiencia y adaptación: reducir pasos, simplificar el cambio de estado y verificar los recorridos en móvil, tableta y escritorio. Complementar la feature 010.

Antes de cada etapa se detallarán su spec, plan, tareas y criterios verificables; se desarrollará y revisará por separado. La actualización de dependencias exige comprobar versiones y compatibilidades antes de instalarlas.

## Decisiones del flujo

Los ítems pertenecen a un cliente y usuario. Solo se seleccionan ítems pendientes del cliente elegido; al generar una cuenta pasan a added y al marcarla pagada a paid. Reabrir una cuenta pagada los devuelve a added. Los ítems de cuentas pendientes se pueden editar actualizando el total; en cuentas pagadas se requiere reabrir antes. Al eliminar una cuenta pendiente se desvinculan y vuelven a pending.

La migración debe conservar el historial y adaptar el valor histórico payed. Proteger las escrituras por propietario y asegurar la asignación de ítems frente a operaciones concurrentes. Diseñar y ensayar la migración y su recuperación antes de aplicarla.

## Verificación

TDD por funcionalidad; validar dominio y componentes con Vitest, recorridos críticos con Playwright y servicios de prueba aislados, además de pruebas de migración, aislamiento entre usuarios, concurrencia, PDF, accesibilidad y responsive. No almacenar credenciales en el repositorio.

El usuario aplazó la ejecución E2E y la corrección de lint hasta después de los cambios de lógica y UI/UX. La comprobación de tipos se ejecuta por separado porque el build la omite.
