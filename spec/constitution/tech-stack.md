# Tech stack y convenciones

## Tecnologías observadas

- TypeScript, Next.js y React; tRPC y Zod; Clerk para autenticación.
- La conexión y el esquema actuales utilizan Drizzle `singlestore` / `singlestore-core` y `mysql2/promise` (`src/server/db/index.ts`, `schema.ts`). Aunque las instrucciones de proyecto mencionan PostgreSQL con SingleStore, esta implementación no muestra un adaptador PostgreSQL.
- UI con Tailwind CSS, Radix y componentes locales; PDF mediante `@react-pdf/renderer`.
- Vitest y Playwright son herramientas previstas en instrucciones, pero no figuran instaladas ni existe script de pruebas en `package.json`.
- El README declara despliegue completado; el proveedor y el estado actual no fueron verificados.

## Módulos clave

- `src/app/`: rutas y layouts; `src/components/`: componentes y formularios.
- `src/actions/`: acceso desde acciones; `src/server/api/`: routers tRPC.
- `src/server/db/`: conexión y esquema; `src/middleware.ts`: protección de rutas.
- `src/styles/globals.css`, `tailwind.config.ts`: tema visual.

## Comandos

- `pnpm run dev`, `pnpm run build`, `pnpm run lint`, `pnpm run typecheck`, `pnpm run check`.
- No hay comando de tests configurado; implementar y ejecutar la suite es trabajo pendiente.

## Modelo de dominio

- `actor`: cliente o acreedor, datos de identificación, `ownerId` e indicador `isActive`.
- `billing_statement`: referencias a cliente y acreedor, monto, fecha, información adicional, estados `pending` / `payed` y visibilidad de montos de ítems.
- `billing_statement_item`: descripción, monto, referencia a cuenta y propietario. Las entidades tienen marcas de creación y actualización.

## Convenciones y límites

- Aplicar las instrucciones vigentes de `AGENTS.md`, incluida validación en ambos extremos, Result para código nuevo o modificado, TDD, separación de pruebas y pnpm.
- No añadir dependencias sin avisar; secretos en variables de entorno; no subir archivos `.env*`; no usar `any` sin justificar.
- La interfaz actual usa fondo oscuro, verde y fuente Geologica. La adaptación móvil está pendiente.
- No asumir que todos los endpoints filtran por propietario: las mutaciones de cuentas e ítems observadas actualizan por ID; revisar la autorización antes de extenderlas.
