# 011 · Pruebas automatizadas

**Estado:** recorridos E2E con servicios simulados implementados; validación con servicios reales pendiente.

## Qué hace

Incorporar pruebas automatizadas para lógica, componentes y flujos de usuario.

## Por qué

Detectar regresiones y hacer verificable el comportamiento.

## Criterios de aceptación

- [x] Existe un comando de pruebas documentado que termina correctamente.
- [x] Se cubren reglas de dominio, componentes y recorridos críticos con servicios simulados en navegador.
- [x] Los tests se organizan por dominio y tipo conforme a AGENTS.md.

## Evidencia y pendientes

- El 9 de noviembre de 2026 `pnpm run test` completó 12 pruebas de unidad y componentes; `pnpm run typecheck`, `pnpm run build` y `pnpm exec drizzle-kit check` finalizaron correctamente.
- La etapa 021 ejecutó 31 recorridos de Playwright en escritorio y móvil con servicios simulados; una prueba táctil se omite únicamente en escritorio y pasa en móvil. Incluye descargas reales de PDF, lotes, teclado, errores, volumen y objetivos de rendimiento local. Pasaron además 179 pruebas de lógica/componentes y la comprobación de tipos. La validación real de acceso con Clerk y de persistencia/concurrencia conserva su etapa independiente.
- La etapa 022 resolvió los errores/avisos de lint sin desactivar reglas; el comando rechaza avisos y `check` incluye tipos. El build omite esa validación, que sigue ejecutándose por separado.
