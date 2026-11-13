# 015 · Experiencia y adaptación

**Estado:** implementado y validado mediante pruebas automatizadas; pendiente de revisión visual y táctil del usuario.

## Objetivo

Simplificar la portada y el resumen, priorizar los formularios de acceso en móvil y renovar las vistas operativas para que sean claras y usables en distintos dispositivos.

## Criterios de aceptación

- [ ] La portada y el resumen no incluyen los textos que el usuario señaló como sobrantes ni su línea decorativa asociada.
- [ ] El acceso y registro presentan el formulario de Clerk en la primera vista móvil, sin exigir desplazamiento previo para encontrarlo.
- [ ] Se evita colocar textos decorativos sobre títulos y se conserva la identidad visual acordada.
- [ ] Las vistas de cuentas, ítems, clientes y acreedores presentan sus acciones y datos de forma clara en móvil y escritorio, con teclado, estados vacíos y errores accesibles.
- [ ] Las cargas asíncronas usan skeletons accesibles con espacio similar al contenido, evitando loaders que provoquen saltos de diseño.
- [ ] Las cuentas aparecen en filas expandibles con edición en contexto, filtros por cliente, estado y fechas, y paginación coherente.
- [ ] La selección múltiple es accesible con teclado y mediante gesto prolongado en pantallas táctiles; permite marcar pagadas o eliminar por lotes y comunica confirmación, éxitos y errores parciales.
- [ ] Se presentan alternativas de indicadores con su definición y limitaciones; solo se implementa la opción aprobada por el usuario.
- [ ] Pasan pruebas de componentes, lógica, tipos y build; E2E, lint global y ensayos de datos permanecen en la etapa final acordada.

## Validación y límites

La suite ejecutada contiene 139 pruebas aprobadas, incluida la generación del PDF y su actualización tras editar una cuenta. El build y la comprobación de tipos pasaron. La pulsación prolongada se probó mediante eventos simulados; queda por comprobar visualmente en dispositivos reales. La comprobación previa del estado para acciones masivas y la actualización no forman una única operación atómica; los ensayos de concurrencia siguen previstos para la etapa final. E2E, lint global y ensayos sobre datos reales permanecen aplazados.
