# 025 · Plan

## Preparación

1. Revisar guía SDD, README anterior, documentación del producto y diseño, roadmap, package scripts, configuración de entorno y harness E2E.
2. Contrastar las capacidades descritas con las features actuales y el esquema.
3. Redactar `spec.md`, `plan.md` y `tasks.md` antes de modificar el README.

## Ejecución

1. Escribir README en español con presentación de producto, origen personal autorizado, flujo, alcance y stack breve.
2. Añadir instrucciones conservadoras de instalación y comandos; no ejecutar scripts de instalación ni conectar servicios.
3. Actualizar el índice `spec/README.md` y `spec/constitution/roadmap.md` para reflejar el nuevo documento.

## Revisión documental

1. Revisar enlaces relativos, comandos, variables y lenguaje frente a las fuentes observadas.
2. Verificar el diff y que no se hayan modificado código de la aplicación ni datos.
3. Mantener tareas pendientes de validación hasta contar con evidencia documental final.

## Integración

Resolver únicamente el conflicto de README del merge ya iniciado hacia `main`, incorporar esta documentación y preservar el resto del índice. Cerrar con el mensaje de merge existente. Después, actualizar `develop` mediante avance rápido hacia el resultado y devolver el worktree principal a `main`.

## Restricciones

Este cambio documental no requiere nuevas pruebas de comportamiento, instalaciones, restauraciones ni operaciones contra servicios. Se validan enlaces y comandos y se ejecutan las comprobaciones y pruebas existentes antes de cerrar el merge. No se repiten build ni E2E: el código coincide con la etapa 024, donde ya se validaron.
