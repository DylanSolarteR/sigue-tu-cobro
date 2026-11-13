# 012 · Modernización de Sigue Tu Cobro

**Estado:** base técnica, flujo e interfaz implementados; lint y restauración de históricos completados con la evidencia de [023](../023-restauracion-historicos/spec.md). Servicios reales de Clerk y concurrencia no se validaron.

## Objetivo

Actualizar la base técnica, facilitar la gestión de cuentas e ítems y renovar la experiencia visual de empresarios colombianos en dispositivos de diferentes tamaños, conservando el historial existente.

## Criterios de aceptación

- [x] Hay pruebas automatizadas de dominio, componentes y recorridos críticos; los E2E usan servicios y datos aislados.
- [x] Las dependencias se actualizan por grupos compatibles y se verifican las pruebas, tipos y compilación.
- [x] Se puede crear un ítem asociado a un cliente antes de crear una cuenta y seleccionar los ítems pendientes de ese cliente al generarla.
- [x] Un ítem pasa de `pending` a `added` al vincularlo; al pagar la cuenta pasa a `paid`. Al reabrir la cuenta vuelve a `added`.
- [x] Los ítems de cuentas pendientes pueden editarse y el total se actualiza. Para editar una cuenta pagada, primero debe reabrirse.
- [x] Al eliminar una cuenta pendiente, sus ítems se desvinculan y regresan a `pending`.
- [x] Restaurar los datos actuales de `v1` al formato `v2`, adaptar estados, sustituir registros de prueba y verificar conteos, montos, fechas y relaciones; evidencia en 023.
- [x] El PDF y los indicadores reflejan los datos del nuevo flujo. Marcar una cuenta como pagada es accesible desde lista o detalle.
- [x] Los componentes migran de shadcn a daisyUI; se rediseñan la landing y la estructura completa del dashboard y del acceso de Clerk, conservando los colores actuales como punto de partida.
- [x] Navegación, formularios y tablas permiten completar los recorridos principales en móvil, tableta y escritorio.

## Alcance y límites

La implementación se divide en etapas revisables; otros problemas de experiencia se identificarán con el usuario. Registrar una cuenta pagada es seguimiento de estado y no implica procesar pagos.

## Alcance de la validación actual

Las etapas 013–021 cubren dominio, componentes y recorridos de navegador con servicios simulados; no verifican Clerk ni concurrencia real. La etapa 022 resolvió el lint global. La etapa 023 restauró los datos históricos y verificó la persistencia con una conexión nueva, además de confirmar intactas las tablas `v1`. La revisión en dispositivos físicos y el despliegue corresponden al usuario.
