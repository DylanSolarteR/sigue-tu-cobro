# 001 · Datos y acceso

**Estado:** implementación presente; validación pendiente

## Qué hace

Permitir que los datos de la aplicación persistan y que las áreas de gestión requieran autenticación.

## Por qué

El usuario necesita recuperar sus registros y controlar el acceso a su información.

## Criterios de aceptación

Estos criterios requieren verificación; la presencia de código o el TODO del README no demuestra su cumplimiento.

- [ ] El acceso a /dashboard requiere una sesión autenticada.
- [ ] Las consultas de clientes, acreedores, cuentas e ítems recuperan datos del propietario.
- [ ] Las operaciones de modificación comprueban la propiedad del registro.

## Fuera de alcance

- Configuración del proveedor y credenciales se resuelven por entorno; no se comprueba la conexión real.
