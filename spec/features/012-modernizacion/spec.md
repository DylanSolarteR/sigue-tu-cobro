# 012 · Modernización de Sigue Tu Cobro

**Estado:** base técnica, flujo e interfaz implementados y validados localmente; quedan lint y restauración de históricos.

## Objetivo

Actualizar la base técnica, facilitar la gestión de cuentas e ítems y renovar la experiencia visual de empresarios colombianos en dispositivos de diferentes tamaños, conservando el historial existente.

## Criterios de aceptación

- [x] Hay pruebas automatizadas de dominio, componentes y recorridos críticos; los E2E usan servicios y datos aislados.
- [x] Las dependencias se actualizan por grupos compatibles y se verifican las pruebas, tipos y compilación.
- [x] Se puede crear un ítem asociado a un cliente antes de crear una cuenta y seleccionar los ítems pendientes de ese cliente al generarla.
- [x] Un ítem pasa de `pending` a `added` al vincularlo; al pagar la cuenta pasa a `paid`. Al reabrir la cuenta vuelve a `added`.
- [x] Los ítems de cuentas pendientes pueden editarse y el total se actualiza. Para editar una cuenta pagada, primero debe reabrirse.
- [x] Al eliminar una cuenta pendiente, sus ítems se desvinculan y regresan a `pending`.
- [ ] Restaurar el respaldo histórico al formato v2, adaptando `payed`, y sustituir los registros actuales creados para pruebas, con comprobación de montos, fechas y relaciones.
- [x] El PDF y los indicadores reflejan los datos del nuevo flujo. Marcar una cuenta como pagada es accesible desde lista o detalle.
- [x] Los componentes migran de shadcn a daisyUI; se rediseñan la landing y la estructura completa del dashboard y del acceso de Clerk, conservando los colores actuales como punto de partida.
- [x] Navegación, formularios y tablas permiten completar los recorridos principales en móvil, tableta y escritorio.

## Alcance y límites

La implementación se divide en etapas revisables; otros problemas de experiencia se identificarán con el usuario. Registrar una cuenta pagada es seguimiento de estado y no implica procesar pagos.

## Alcance de la validación actual

Las etapas 013–021 cubren dominio, componentes y recorridos de navegador con servicios simulados; no verifican servicios reales. El usuario excluyó de la secuencia actual las pruebas con Clerk/SingleStore reales y hará por separado la revisión en dispositivos físicos y el despliegue. El siguiente trabajo es lint y después la restauración. El roadmap se actualizará en cada implementación.
