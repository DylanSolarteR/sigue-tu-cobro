# 022 · Lint global

**Estado:** completada; lint estricto, tipos, pruebas y build de producción aprobados.

## Objetivo y alcance

Corregir los errores y avisos de `pnpm run lint` sin desactivar reglas globales ni modificar la identidad visual o los datos. La línea base fue 76 errores y 24 avisos. La pasada automática dejó 41 errores y 18 avisos; las correcciones manuales resolvieron el resto.

## Cambios

- Imports de tipos, constantes, aserciones redundantes y código sin uso. Se conservan las consultas y filtros de propiedad de los routers.
- Mocks tipados, aserciones sin valores inseguros y esperas de temporizadores/acciones coherentes en las pruebas.
- Formularios y listados de actores reinician su estado al cambiar de identidad/tipo mediante componentes con key, sin reinicios síncronos en efectos.
- El editor notifica al callback vigente mediante useEffectEvent, sin repetir la consulta cuando cambian callbacks del padre.
- useIsMobile se suscribe a matchMedia mediante useSyncExternalStore, con instantánea estable de servidor y limpieza de la suscripción.
- Los comandos lint y lint:fix rechazan también avisos mediante --max-warnings=0; las reglas conservan su configuración.

## Validación

Las pruebas nuevas reprodujeron antes de la corrección el estado antiguo del formulario, la página antigua del listado, el callback obsoleto y la lectura de ancho desacoplada del media query. Después pasaron las pruebas dirigidas, 185 pruebas de regresión y 23 E2E afectados en escritorio/móvil. Una prueba táctil se omite solo en escritorio y pasa en móvil. `pnpm run check` pasó con cero errores y cero avisos, incluyendo el límite explícito `--max-warnings=0` (hc t55). El build de producción pasó (hc t56).

## Límites

No incluye restauración, migraciones, cambios de datos ni pruebas con servicios reales. La revisión física y el despliegue corresponden al usuario. La restauración al formato v2 será la siguiente implementación tras revisar este cierre.
