# 009 · Página 404

**Estado:** implementado y validado localmente.

## Qué hace

Mostrar una página útil cuando una ruta no exista.

## Por qué

Orientar al usuario cuando llega a una dirección inválida.

## Criterios de aceptación

La página utiliza la identidad actual, con contenido y destinos explícitos. No requiere datos de cuenta ni consultas para renderizarse.

- [x] Una ruta inexistente muestra una página 404 clara.
- [x] La página ofrece una forma de volver a un lugar útil.
- [x] La solución funciona en los tamaños admitidos.

## Fuera de alcance

- No incluye otros estados de error.

## Contenido y navegación

Título: «404 · Página no encontrada». Mensaje: «Revisa la dirección o vuelve a una de estas secciones». Acción principal «Volver al inicio» hacia `/`; secundaria «Ir al resumen» hacia `/dashboard/resumen`, conservando su protección existente. La página ocupa el ancho disponible y permite usar ambas acciones en la primera vista de móvil y escritorio.

## Evidencia

180 pruebas de lógica/componentes aprobadas. Se ejecutaron 6 E2E dirigidos (404 y portada) en escritorio y móvil emulado con servicios simulados: HTTP 404 en rutas públicas y del dashboard, recuperación al inicio/resumen, teclado, acciones en la primera pantalla móvil y ausencia de desbordamiento. Tipos y build de producción aprobados. Capturas de ambos tamaños inspeccionadas. No se evaluaron servicios reales ni hardware físico.
