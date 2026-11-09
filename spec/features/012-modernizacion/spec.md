# 012 · Modernización de Sigue Tu Cobro

**Estado:** en progreso; base técnica actualizada, con verificaciones pendientes.

## Objetivo

Actualizar la base técnica, facilitar la gestión de cuentas e ítems y renovar la experiencia visual de empresarios colombianos en dispositivos de diferentes tamaños, conservando el historial existente.

## Criterios de aceptación

- [ ] Hay pruebas automatizadas de dominio, componentes y recorridos críticos; los E2E usan servicios y datos aislados.
- [ ] Las dependencias se actualizan por grupos compatibles y se verifican las pruebas, tipos y compilación; quedan paquetes visuales ligados a la futura migración UI.
- [ ] Se puede crear un ítem asociado a un cliente antes de crear una cuenta y seleccionar los ítems pendientes de ese cliente al generarla.
- [ ] Un ítem pasa de `pending` a `added` al vincularlo; al pagar la cuenta pasa a `paid`. Al reabrir la cuenta vuelve a `added`.
- [ ] Los ítems de cuentas pendientes pueden editarse y el total se actualiza. Para editar una cuenta pagada, primero debe reabrirse.
- [ ] Al eliminar una cuenta pendiente, sus ítems se desvinculan y regresan a `pending`.
- [ ] Los registros existentes se conservan y migran; `payed` se adapta al modelo actualizado. Se impide el acceso a registros ajenos y la asignación concurrente duplicada.
- [ ] El PDF y los indicadores reflejan los datos del nuevo flujo. Marcar una cuenta como pagada es accesible desde lista o detalle.
- [ ] Los componentes migran de shadcn a daisyUI; landing, acceso de Clerk y panel tienen una identidad visual nueva, clara y confiable.
- [ ] Navegación, formularios y tablas permiten completar los recorridos principales en móvil, tableta y escritorio.

## Alcance y límites

La implementación se divide en etapas revisables; otros problemas de experiencia se identificarán con el usuario. Registrar una cuenta pagada es seguimiento de estado y no implica procesar pagos.
