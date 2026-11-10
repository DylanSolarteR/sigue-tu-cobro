# Diseño de SigueTuCobro

La interfaz acompaña a independientes y pequeños empresarios colombianos mientras preparan y siguen sus cuentas de cobro. El panel es espacioso y sencillo; la portada tiene una composición editorial sin imagen de producto. La prioridad visual del panel es crear y seguir cobros.

## Color y tipografía

- Fondo principal: `#0b1512`.
- Superficie de acceso: `#10241e`.
- Acento y acciones destacadas: `#74d5a7`.
- Texto principal: `#edf5ef`.
- Texto secundario sobre oscuro: `#c1d3c8`.
- Superficie editorial clara: `#e8f1e9`, con texto `#142a20`.

La tipografía local Geologica se utiliza para contenido y títulos. Los títulos son claros y de tamaño generoso; las cifras y acciones se mantienen legibles sin competir con la tarea.

## Composición

La portada abre con un mensaje editorial y presenta después los pasos reales del flujo. Las páginas de acceso combinan contexto breve con los formularios de Clerk. El panel usa navegación lateral en escritorio, navegación adaptable en móvil y un resumen con distribución por estado y evolución por fecha de creación.

## Componentes y comportamiento

Los controles emplean los tokens y clases de daisyUI. Los elementos interactivos conservan etiquetas, foco visible y manejo de teclado; Radix permanece de forma transitoria donde su sustitución todavía necesita validación. Se muestran estados de carga, error y vacío sin cifras inventadas.

Los gráficos deben ofrecer valores legibles y texto accesible; la evolución debe identificar la fecha y el valor representados. Mantener rutas de acceso y operaciones existentes, sin añadir afirmaciones sobre pago o envío en línea.
