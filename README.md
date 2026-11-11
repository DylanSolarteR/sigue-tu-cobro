# Sigue Tu Cobro

## TODO

- [x] set up database and data models.
- [x] deploy.
- [x] create and style landing page.
- [x] create dashboard page.
- [x] integrate with clerk.
- [x] add functionality to dashboard page.
- [x] create billing statement page.
- [x] allow users to create billing statement
- [x] create clients page.
- [x] allow users to manage clients
- [x] create collector page.
- [x] allow users to manage creditors
- [x] create config page.
- [x] manual tests, find and fix bugs.
  - [x] fix item creation.
  - [x] fix checkbox sync with updating values in billing statements.
  - [x] change margins and align text to the right in the table in the pdf.
  - [x] fix the grammar errors with the amount spelling in the pdf.
- [x] make a 404 page (rutas públicas/dashboard, teclado y móvil/escritorio emulados).
- [x] make the site responsive (validado en escritorio y móvil emulado).
- [x] make automated tests and pass every one (lógica, componentes y E2E con servicios simulados).
- [x] resolve global lint errors and warnings (etapa 022: cero diagnósticos, tipos, pruebas y build aprobados).
- [ ] restore historical backup into v2 tables, replacing current test data.

Revisión en dispositivos físicos y despliegue: a cargo del usuario. Las pruebas con servicios reales quedan fuera de la secuencia actual por su decisión. Consulta el [roadmap actualizado](spec/constitution/roadmap.md).

## Pruebas

- `pnpm run check` ejecuta lint con límite de cero avisos y después comprueba los tipos.
- `pnpm run test` ejecuta las pruebas unitarias y de componentes; `pnpm run test:watch` las ejecuta en modo observación.
- Instala el navegador con `pnpm exec playwright install chromium` y ejecuta `pnpm run test:e2e`. Playwright compila un harness optimizado en `.next-e2e`, inicia un servidor en `127.0.0.1:3123` y lo detiene al terminar. El puerto debe estar libre; no se reutilizan servidores externos.
- La suite usa Clerk y backend simulados con estado local reiniciado por prueba; conserva las acciones, validación, interfaz y generación de PDF reales. `E2E_USER_ID` puede definirse en `.env.e2e.local` para usar una identidad local autorizada; sin ella se emplea una identidad ficticia. Nunca versionar ese archivo.
- Los mocks se activan únicamente en el harness. La conexión real aborta en modo E2E y el comando de producción rechaza los flags del harness. No se necesitan credenciales reales para estas pruebas. No demuestran autenticación, persistencia ni rendimiento de los servicios reales.
- Los proyectos `desktop` y `mobile` prueban recorridos y volumen. Para una ejecución dirigida: `pnpm run test:e2e --project=mobile`. Las pruebas de rendimiento usan cinco muestras tras un calentamiento, sin otras suites o builds concurrentes; conservan JSON, capturas y trazas en `test-results/` y el reporte HTML en `playwright-report/`.
- `pnpm run typecheck` verifica tipos por separado y `pnpm run build` genera la compilación final con servicios reales. Los ensayos de migración/restauración y de concurrencia real siguen siendo una validación independiente.
