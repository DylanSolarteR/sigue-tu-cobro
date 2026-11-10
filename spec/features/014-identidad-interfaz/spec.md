# 014 · Identidad e interfaz

**Estado:** en curso; pendiente de validación.

## Qué hace

Renueva la portada, el acceso, el registro y la estructura del panel para que los empresarios puedan entender el producto y completar sus tareas con claridad en distintos dispositivos.

## Por qué

La estructura actual de las páginas no satisface las expectativas del usuario y el acceso y la navegación son difíciles en pantallas pequeñas.

## Criterios de aceptación

- [ ] La landing presenta el producto y permite iniciar sesión y registrarse desde móvil y escritorio.
- [ ] Las páginas de acceso y registro conservan los flujos de Clerk y comparten la identidad visual del producto.
- [ ] La disposición completa del dashboard y su navegación se rediseñan; los usuarios pueden acceder a resumen, cuentas, ítems, clientes, acreedores y configuración.
- [ ] El resumen incluye gráficas comprensibles de estados y evolución de los cobros por fecha, basadas en datos reales y con alternativas legibles para estados vacíos y accesibilidad.
- [ ] Formularios, listados, navegación, estados de carga, vacío y error conservan su comportamiento y pueden usarse en móvil y escritorio.
- [ ] Los controles interactivos tienen nombre accesible, foco visible y funcionamiento con teclado; el texto y las acciones mantienen contraste legible.
- [ ] El rediseño usa daisyUI en lugar de los componentes shadcn, preservando el comportamiento accesible de los controles complejos.
- [ ] Las pruebas de componentes y lógica siguen pasando; la ejecución E2E y la revisión global de lint se mantienen en la etapa final de modernización.

## Fuera de alcance

- Cambios en el modelo de datos o aplicación de la migración de registros históricos.
- Ejecución de E2E, restauración, concurrencia real y revisión global de lint, previstas para la etapa final.
