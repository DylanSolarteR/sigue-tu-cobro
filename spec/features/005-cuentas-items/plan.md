# 005 · Cuentas e ítems — Plan

## Enfoque

Reconstrucción técnica del código existente, no un registro de decisiones históricas.

## Implementación

1. Implementar rutas y formularios en dashboard/cuentas-cobro y src/components/dashboard/billing-statements/.
2. Usar acciones de cuenta e ítem en src/actions/ y routers correspondientes en src/server/api/routers/.
3. Almacenar cuentas e ítems según src/server/db/schema.ts.

## Decisiones

- El enfoque descrito se observa en el código; no se infiere por qué se eligió ni qué alternativas se descartaron.

## Riesgos

- Las mutaciones de cuentas e ítems filtran por ID sin ownerId; la validación de autorización permanece pendiente.
