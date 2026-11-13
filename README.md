# SigueTuCobro

SigueTuCobro es una aplicación web para trabajadores independientes y pequeños negocios colombianos que necesitan organizar sus cuentas de cobro y hacer seguimiento a su estado.

El proyecto nació de una necesidad cercana: mi padre trabaja de forma independiente en el sector de maquinaria y gestiona sus cobros a empresas mediante cuentas de cobro. La creé para reunir en un mismo lugar sus clientes, los trabajos realizados y el seguimiento de esos cobros.

## Flujo de uso

1. Registra clientes y acreedores en el directorio.
2. Crea ítems de trabajo para un cliente.
3. Selecciona sus ítems pendientes y genera una cuenta.
4. Descarga el PDF y sigue su estado manualmente; puedes reabrir la cuenta para actualizarla.

## Funcionalidades

- **Directorio:** registra clientes y acreedores.
- **Ítems y cuentas:** registra y edita ítems asociados a un cliente; los seleccionados para una cuenta pasan a estado **añadido**. También puedes actualizar los datos de una cuenta.
- **Estados y acciones:** sigue cada cuenta como **pendiente** o **pagada** de forma manual; la aplicación no procesa pagos. Selecciona varias cuentas pendientes para marcarlas como pagadas o eliminarlas en conjunto.
- **Búsqueda y navegación:** filtra cuentas por cliente, estado y fechas; los listados tienen paginación.
- **Resumen:** consulta indicadores, una gráfica de línea y un ranking de clientes por valor de cuentas pagadas, filtrado por fecha prevista de pago. Esta fecha no necesariamente indica cuándo se recibió el pago.
- **PDF:** genera un documento PDF de la cuenta de cobro.
- **Cuenta e interfaz:** inicia sesión, gestiona tu perfil y trabaja desde distintos tamaños de pantalla.

## Tecnologías

Next.js, React y TypeScript; Tailwind CSS y daisyUI; Clerk; tRPC, Zod, Drizzle ORM y SingleStore. Los documentos PDF se generan con `@react-pdf/renderer`. Las pruebas usan Vitest y Playwright.

## Requisitos

- Node.js 20.9 o superior (22.18 fue la versión probada para esta guía).
- pnpm 10.4.1, fijado en `package.json`.
- Una base SingleStore ya aprovisionada con el esquema vigente del proyecto.
- Claves y configuración de Clerk para autenticación.

## Inicio local

Con el repositorio clonado, desde su raíz instala dependencias y crea tu archivo local de entorno:

```bash
pnpm install --frozen-lockfile
cp .env.example .env
```

Completa `.env` con los valores de tu instancia SingleStore y de Clerk, incluidos `DATABASE_URL` y las variables requeridas por la aplicación que aparecen en [`src/env.js`](src/env.js) y [`.env.example`](.env.example). El esquema de referencia está en [`src/server/db/schema.ts`](src/server/db/schema.ts); la base debe estar aprovisionada con ese esquema antes de iniciar. No subas `.env` ni otros archivos de entorno al repositorio.

```bash
pnpm dev
```

## Comandos

| Comando | Uso |
| --- | --- |
| `pnpm dev` | Inicia Next.js en modo desarrollo. |
| `pnpm check` | Ejecuta lint y verificación de tipos. |
| `pnpm test` | Ejecuta pruebas unitarias y de componentes con Vitest. |
| `pnpm test:e2e` | Ejecuta flujos de navegador con Playwright. |
| `pnpm build` | Genera el build de producción. |
| `pnpm start` | Sirve el build generado localmente. |

Para preparar Chromium antes de la primera ejecución E2E:

```bash
pnpm exec playwright install chromium
```

Las pruebas E2E usan datos, sesión y backend simulados. No requieren ni consultan SingleStore o Clerk reales, y no validan su configuración, persistencia o autenticación. El servidor E2E incluye controles que impiden habilitar los mocks durante un build de producción; no reutilices su configuración en producción.

Para generar y servir un build de producción local:

```bash
pnpm build
pnpm start
```

## Documentación

- [Producto y capacidades](PRODUCT.md)
- [Sistema de diseño](DESIGN.md)
- [Índice de especificaciones](spec/README.md)
- [Roadmap](spec/constitution/roadmap.md)
