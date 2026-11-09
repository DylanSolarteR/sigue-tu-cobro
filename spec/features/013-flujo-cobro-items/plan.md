# 013 · Flujo de cobro por ítems — Plan

## Enfoque

Desarrollar con TDD el flujo y sus interfaces tRPC, con validación de entradas y autorización por propietario. Mantener los datos históricos y compatibilidad del PDF y resumen.

## Implementación

1. Examinar el esquema y los datos existentes, incluidos registros inactivos y referencias inconsistentes, sin imprimir secretos ni modificar producción. Diseñar migración versionada y recuperación; ensayarlas en base aislada antes de cualquier aplicación.
2. Ajustar el modelo de ítems para que puedan asociarse al cliente antes de la cuenta y representar `pending`, `added` y `paid`. Migrar el cliente y estado desde la cuenta histórica y convertir `payed` preservando sus registros; detectar inconsistencias antes de proceder.
3. Implementar las operaciones de ítems, generación de cuenta y cambios de estado. Verificar propiedad, cliente y estado en el servidor; realizar asignación y actualización de totales de forma atómica y rechazar selecciones obsoletas o concurrentes.
4. Adaptar las vistas existentes para crear ítems, seleccionar pendientes y operar cuentas; actualizar lista o detalle, PDF y resumen de acuerdo con el nuevo modelo.
5. Probar la migración en datos representativos, controles de autorización, concurrencia, transiciones, cálculo de totales y regresiones de PDF y resumen. Ejecutar pruebas unitarias e integración, typecheck y build.

## Dependencias y decisiones pendientes

Se requiere un entorno de base de datos aislado para ensayar migración y concurrencia. Antes de aplicar cambios a datos reales se necesita una estrategia de respaldo y recuperación verificada. El tratamiento de registros inconsistentes o estados no cubiertos se resolverá con evidencia y, si afecta reglas de negocio, con el usuario antes de modificar datos.
