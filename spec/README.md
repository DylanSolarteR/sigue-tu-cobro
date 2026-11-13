# Especificaciones del proyecto

Las especificaciones iniciales 001–010 se reconstruyeron retrospectivamente desde el código y el TODO de `README.md`, revisados el 9 de noviembre de 2026. Las etapas posteriores documentan la modernización y sus validaciones. El roadmap consolida el estado vigente; las listas antiguas se actualizan con evidencia y distinguen exclusiones de criterios verificados.

- [Constitución](constitution/mission.md) · [Stack y convenciones](constitution/tech-stack.md) · [Roadmap](constitution/roadmap.md)
- Cada feature contiene `spec.md`, `plan.md` y `tasks.md`. La evidencia apunta al código existente; las casillas de aceptación y validación permanecen abiertas hasta comprobar el comportamiento.
- Las afirmaciones de estado se distinguen de pruebas o despliegues verificados durante esta documentación.
- La restauración histórica vigente se especifica en [023](features/023-restauracion-historicos/spec.md). Los SQL y el procedimiento preliminar bajo 013 son borradores obsoletos y no deben ejecutarse.
- La paginación uniforme está implementada y validada en [024](features/024-paginacion-uniforme/spec.md); la evidencia E2E, check, build y revisión visual está en sus tareas.
- El README de producto y puesta en marcha se actualizó y revisó en [025](features/025-readme-produccion/spec.md), con el origen del proyecto y su guía de uso y ejecución.
- Para trabajo futuro: especificar, planificar, desglosar tareas, implementar con TDD y actualizar el roadmap conforme a `spec_template/README.md`.
