# 011 · Pruebas automatizadas

**Estado:** en progreso; ejecución E2E aplazada por decisión del usuario.

## Qué hace

Incorporar pruebas automatizadas para lógica, componentes y flujos de usuario.

## Por qué

Detectar regresiones y hacer verificable el comportamiento.

## Criterios de aceptación

- [x] Existe un comando de pruebas documentado que termina correctamente.
- [ ] Se cubren reglas de dominio, componentes y recorridos críticos.
- [ ] Los tests se organizan por dominio y tipo conforme a AGENTS.md.

## Evidencia y pendientes

- El 9 de noviembre de 2026 `pnpm run test` completó 12 pruebas de unidad y componentes; `pnpm run typecheck`, `pnpm run build` y `pnpm exec drizzle-kit check` finalizaron correctamente.
- Playwright está configurado, pero la ejecución E2E de recorridos críticos se realizará después de los cambios de lógica y UI/UX, con servicios aislados. La validación real de acceso con Clerk también está pendiente.
- Se aplaza la corrección de los errores y avisos de lint hasta después de esos cambios. El build omite la validación de tipos, que se ejecutó por separado.
