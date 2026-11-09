# 013 · Flujo de cobro por ítems

**Estado:** especificado; pendiente de implementación y validación.

## Objetivo

Permitir registrar conceptos de cobro de un cliente antes de emitir la cuenta, seleccionar los pendientes y conservar las cuentas y conceptos históricos.

## Criterios de aceptación

- [ ] El usuario crea y consulta ítems propios asociados a un cliente; un ítem nuevo está `pending`.
- [ ] Al generar una cuenta para un cliente, solo se seleccionan ítems propios de ese cliente en estado `pending`; los seleccionados pasan a `added` y el importe corresponde a su suma.
- [ ] Al marcar pagada una cuenta, sus ítems pasan a `paid`; al reabrirla vuelven a `added`.
- [ ] Los ítems vinculados a una cuenta pendiente se pueden editar y el total se actualiza. En cuentas pagadas se debe reabrir primero.
- [ ] Al eliminar una cuenta pendiente, sus ítems regresan a `pending` y se desvinculan para reutilizarse.
- [ ] No se permiten accesos ni escrituras sobre registros de otro propietario; la selección concurrente no puede asignar el mismo ítem dos veces.
- [ ] Se migran los datos existentes conservando el historial; el estado histórico `payed` se adapta al nuevo modelo. El PDF y el resumen reflejan los datos migrados.
- [ ] Existe acceso directo para marcar una cuenta como pagada desde su lista o detalle.

## Límites

El estado pagado registra seguimiento; no procesa pagos. La ejecución de E2E y la revisión de lint se aplazan hasta después de lógica y UI/UX, según la decisión del usuario.
