# 001 · Datos y acceso — Plan

## Enfoque

Reconstrucción técnica del código existente, no un registro de decisiones históricas.

## Implementación

1. Crear y actualizar esquemas de actor, cuenta e ítem en src/server/db/schema.ts.
2. Conectar SingleStore con Drizzle y mysql2 en src/server/db/index.ts.
3. Proteger /dashboard mediante Clerk en src/middleware.ts y procedimientos privados en src/server/api/trpc.ts.

## Decisiones

- El enfoque descrito se observa en el código; no se infiere por qué se eligió ni qué alternativas se descartaron.

## Riesgos

- Las mutaciones de cuentas e ítems filtran por ID sin ownerId; no se afirma aislamiento completo. Revisar autorización, relaciones y referencias antes de considerarla validada.
