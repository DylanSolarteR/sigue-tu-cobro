# Plan

1. Adaptar `UserProfile` mediante `appearance`, sin sustituir las funciones de Clerk.
2. Compilar un entorno aislado con fixtures locales, acciones reales y barreras contra servicios reales; comprobar las barreras antes de recorrer datos.
3. Ejecutar recorridos funcionales y una línea base de volumen/rendimiento en Chromium.
4. Corregir los problemas observados: PDF bajo demanda y paginación de pendientes con selección persistente.
5. Repetir escritorio y móvil, recopilar métricas, ejecutar regresión y tipos y después el build final. Documentar limitaciones e integrar en develop; el usuario despliega.
