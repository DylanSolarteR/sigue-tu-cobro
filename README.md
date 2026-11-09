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
- [ ] make a 404 page.
- [ ] make the site responsive.
- [ ] make automated tests and pass every one.

## Pruebas

- `pnpm run test` ejecuta las pruebas unitarias y de componentes; `pnpm run test:watch` las ejecuta en modo observación.
- Para E2E, instala Chromium con `pnpm exec playwright install chromium`. Configura una instancia separada de la aplicación con una base SingleStore de pruebas y credenciales de Clerk de pruebas, sin datos reales. Inicia esa instancia manualmente.
- Define `E2E_BASE_URL` con la dirección de esa instancia y ejecuta `pnpm run test:e2e`. En PowerShell, por ejemplo: `$env:E2E_BASE_URL = "http://127.0.0.1:3001"`. No existe URL predeterminada ni se inicia un servidor automáticamente. Playwright usa la instancia indicada; comprueba que sea la de pruebas antes de ejecutarlo.
- Guarda las credenciales en variables de entorno, nunca en archivos versionados. Actualmente la suite E2E solo verifica la portada y no cubre aún recorridos autenticados.
