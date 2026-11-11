# 014 · Identidad e interfaz

**Estado:** implementado y validado localmente; revisión física a cargo del usuario.

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
- [x] Las pruebas de lógica/componentes y los E2E con mocks pasan; la revisión global de lint es el siguiente trabajo.

## Fuera de alcance

- Cambios en el modelo de datos o aplicación de la migración de registros históricos.
- Revisión global de lint y restauración histórica: siguientes trabajos, en ese orden después de la 404. Las pruebas con servicios reales se excluyeron por decisión del usuario.

## Seguimiento consolidado

Las etapas 015–021 completaron controles, vistas y recorridos de navegador con mocks. Los criterios anteriores se interpretan dentro de ese alcance, sin afirmar validación de Clerk o SingleStore reales. El roadmap registra lint y restauración como siguientes trabajos.
