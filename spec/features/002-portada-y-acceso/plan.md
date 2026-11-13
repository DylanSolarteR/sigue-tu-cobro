# 002 · Portada y acceso — Plan

## Enfoque

Reconstrucción técnica del código existente, no un registro de decisiones históricas.

## Implementación

1. Renderizar src/app/page.tsx y src/components/Navbar.tsx.
2. Mostrar los componentes de Clerk en src/app/entrar/ y src/app/registro/.
3. Configurar ClerkProvider en src/app/layout.tsx.

## Decisiones

- El enfoque descrito se observa en el código; no se infiere por qué se eligió ni qué alternativas se descartaron.

## Riesgos

- En la navegación se observan enlaces distintos según breakpoint; no se ha verificado su destino en ejecución.
