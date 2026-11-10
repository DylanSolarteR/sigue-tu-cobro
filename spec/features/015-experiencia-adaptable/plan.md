# 015 · Experiencia y adaptación — Plan

1. Evaluar las vistas actuales y proponer indicadores basados únicamente en datos disponibles; acordar los elegidos.
2. Escribir pruebas y simplificar los textos señalados; dar prioridad al formulario de Clerk en pantallas pequeñas.
3. Mediante TDD adaptar listados y formularios del panel para móvil y escritorio, manteniendo sus operaciones, accesibilidad y estados.
4. Implementar solo las analíticas acordadas, nombrar los periodos correctamente y verificar los casos vacíos y de error.
5. Ejecutar pruebas, typecheck y build; revisar visualmente cuando sea posible y registrar limitaciones. No modificar datos ni ejecutar E2E o ensayos de migración en esta etapa.

Una cuenta vencida es una cuenta pendiente cuya fecha prevista de pago es anterior al día actual en Colombia. No se inferirá una fecha efectiva de pago de datos que no la registran.

El listado de cuentas se presentará como filas expandibles, con filtros por cliente, estado y fecha prevista de pago y paginación. La selección múltiple tendrá controles accesibles en escritorio y pulsación prolongada en móvil; las acciones por lote deben respetar las reglas existentes y mostrar resultados parciales cuando alguna operación falle.

Los skeletons reservarán espacio para contenido asíncrono, incluido el formulario de Clerk, los indicadores y las listas. El gesto táctil y la disposición móvil requieren revisión visual en un dispositivo real; las pruebas automatizadas simulan la interacción.
