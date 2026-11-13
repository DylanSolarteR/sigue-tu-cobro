# Tech stack y convenciones

## Tecnologías observadas

- TypeScript, Next.js y React; tRPC y Zod; Clerk para autenticación.
- La conexión y el esquema actuales utilizan Drizzle `singlestore` / `singlestore-core` y `mysql2/promise` (`src/server/db/index.ts`, `schema.ts`). Aunque las instrucciones de proyecto mencionan PostgreSQL con SingleStore, esta implementación no muestra un adaptador PostgreSQL.
- UI con Tailwind CSS, daisyUI y componentes locales; PDF mediante `@react-pdf/renderer`.
- Vitest y Playwright están instalados y configurados. La suite más reciente de la restauración reportó 229 pruebas en 49 archivos; `pnpm run check` pasó con cero errores/avisos y tipos aprobados. Los conteos por etapa corresponden a ejecuciones concretas, no a validación de servicios reales.
- Un build aprobado no acredita un despliegue.

## Módulos clave

- `src/app/`: rutas y layouts; `src/components/`: componentes y formularios.
- `src/actions/`: acceso desde acciones; `src/server/api/`: routers tRPC.
- `src/server/db/`: conexión y esquema; `src/proxy.ts`: protección de rutas.
- `src/styles/globals.css`, `tailwind.config.ts`: tema visual.

## Comandos

- `pnpm run dev`, `pnpm run build`, `pnpm run lint`, `pnpm run typecheck`, `pnpm run check`.
- Las pruebas E2E usan servicios simulados; no acreditan operaciones con Clerk o SingleStore reales.

## Modelo de dominio

- `actor`: cliente o acreedor, datos de identificación, `ownerId` e indicador `isActive`.
- `billing_statement`: referencias a cliente y acreedor, monto, fecha, información adicional y estados `pending` / `paid`; incluye visibilidad de montos de ítems.
- `billing_statement_item`: descripción, monto, cliente, referencia opcional a cuenta y propietario; estados `pending`, `added` y `paid`. Las entidades tienen marcas de creación y actualización.
- El despliegue nuevo usa tablas `v2`; la restauración histórica está especificada en [023](../features/023-restauracion-historicos/spec.md) y no se considera aplicada hasta contar con evidencia.

## Convenciones y límites

- Aplicar las instrucciones vigentes de `AGENTS.md`, incluida validación en ambos extremos, Result para código nuevo o modificado, TDD, separación de pruebas y pnpm.
- No añadir dependencias sin avisar; secretos en variables de entorno; no subir archivos `.env*`; no usar `any` sin justificar.
- La interfaz usa daisyUI y es adaptable a escritorio y móvil emulado; la revisión en dispositivos físicos corresponde al usuario.
- Las suites simuladas no demuestran autorización/persistencia real de Clerk o SingleStore, aislamiento ni concurrencia reales. Esas validaciones quedan fuera de esta secuencia por decisión del usuario.
