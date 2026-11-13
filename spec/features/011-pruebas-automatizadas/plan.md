# 011 · Pruebas automatizadas — Plan

## Enfoque

Establecer una base de pruebas antes de actualizar dependencias y modificar el flujo de cobro. Seguir TDD en los cambios posteriores.

## Implementación

1. Configurar Vitest para pruebas unitarias y de componentes, separadas entre app/tests y server/tests por tipo.
2. Configurar Playwright para recorridos críticos con base de datos y Clerk de prueba aislados; documentar requisitos y comandos sin incluir secretos. La ejecución E2E se pospone hasta completar los cambios de lógica y UI/UX.
3. Crear pruebas iniciales significativas para lógica de dominio y al menos un recorrido de usuario, sin usar datos reales.
4. Actualizar dependencias en grupos compatibles, ejecutar pruebas, comprobación de tipos y build; registrar bloqueos y resultados.

## Riesgos

Las credenciales y recursos aislados de pruebas pueden requerir configuración externa. La compatibilidad de versiones debe comprobarse antes de actualizar.
