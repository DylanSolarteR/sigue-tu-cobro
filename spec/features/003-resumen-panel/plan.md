# 003 · Resumen del panel — Plan

## Enfoque

Reconstrucción técnica del código existente, no un registro de decisiones históricas.

## Implementación

1. Componer el layout y la barra lateral en src/app/(dashboard)/layout.tsx y src/components/SidebarDashboard.tsx.
2. Calcular indicadores mediante src/server/api/routers/billing-statement.ts y presentarlos en dashboard/resumen/.
3. Presentar tarjetas en src/components/dashboard/summary/KPICard.tsx.

## Decisiones

- El enfoque descrito se observa en el código; no se infiere por qué se eligió ni qué alternativas se descartaron.

## Riesgos

- La corrección de cifras y navegación requiere pruebas con datos reales y autenticación.
