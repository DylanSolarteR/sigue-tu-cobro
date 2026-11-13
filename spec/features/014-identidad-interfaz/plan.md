# 014 · Identidad e interfaz — Plan

## Enfoque

Reemplazar la disposición de portada, panel y acceso con una identidad clara y coherente, tomando como referencia la paleta oscura y verde existente. El panel prioriza tareas y lectura; la portada comunica el valor de las cuentas de cobro y facilita el acceso.

## Implementación

1. Definir tokens de color, tipografía, espacios y componentes en `DESIGN.md`, respetando las preferencias visuales acordadas.
2. Integrar daisyUI con Tailwind y migrar las primitivas y sus consumidores, incluyendo formularios, tablas, navegación y componentes interactivos. Eliminar dependencias anteriores únicamente cuando dejen de utilizarse.
3. Rediseñar la portada y los contenedores de acceso y registro de Clerk. Mantener enlaces y recorridos de autenticación existentes.
4. Rediseñar el shell y las páginas del dashboard, incluidas cuentas, ítems, clientes, acreedores, resumen y configuración. Preservar operaciones, estados de error y validaciones.
   Incorporar en el resumen visualizaciones de distribución por estado y evolución temporal con datos reales; identificar claramente qué fecha y valor se representan.
5. Verificar jerarquía y funcionamiento a tamaños de móvil, tableta y escritorio; añadir pruebas de componentes relevantes, ejecutar la suite, tipos y build, y registrar evidencia.

## Decisiones y riesgos

- Los colores actuales sirven como punto de partida; se reemplaza la estructura visual del panel y del login conforme a lo solicitado.
- Los componentes complejos deben mantener manejo de foco, teclado y lectores de pantalla al sustituir Radix/shadcn; la migración no debe degradar su comportamiento.
- La ejecución E2E y la revisión global de lint permanecen en la etapa final; los nuevos cambios se cubren mediante pruebas adecuadas de componentes.
- Las tablas v2 y los datos históricos no se modifican durante este rediseño.
