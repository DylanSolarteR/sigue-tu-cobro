# 006 · PDF de cuenta — Plan

## Enfoque

Reconstrucción técnica del código existente, no un registro de decisiones históricas.

## Implementación

1. Generar el documento mediante src/components/generatePDF.tsx y @react-pdf/renderer.
2. Usar src/lib/numeroALetras.ts para la representación textual de valores.
3. Conectar la generación desde los componentes de cuentas de cobro.

## Decisiones

- El enfoque descrito se observa en el código; no se infiere por qué se eligió ni qué alternativas se descartaron.

## Riesgos

- El formato visual y la gramática dependen de casos concretos; validar documentos generados.
