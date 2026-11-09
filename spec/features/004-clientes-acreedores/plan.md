# 004 · Clientes y acreedores — Plan

## Enfoque

Reconstrucción técnica del código existente, no un registro de decisiones históricas.

## Implementación

1. Usar rutas de dashboard/clientes y dashboard/acreedores y componentes de src/components/dashboard/.
2. Gestionar consultas y mutaciones en src/server/api/routers/actor.ts y acciones en src/actions/actor.api.ts.
3. Persistir ambos tipos en la tabla actor de src/server/db/schema.ts.

## Decisiones

- El enfoque descrito se observa en el código; no se infiere por qué se eligió ni qué alternativas se descartaron.

## Riesgos

- La validación de actualización de cliente y acreedor no es idéntica; comprobar límites antes de considerarla uniforme.
