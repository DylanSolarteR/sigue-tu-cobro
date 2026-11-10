---
name: SigueTuCobro
description: Sistema visual para organizar y seguir cuentas de cobro con claridad.
colors:
  fondo-carbon: "#0b1512"
  superficie-carbon: "#0b1512"
  superficie-campo: "#101815"
  superficie-secundaria: "#1b201f"
  borde-foco: "#87bba5"
  borde-campo: "#40544b"
  seleccion-fondo: "rgb(11 21 18 / 0.5)"
  primario: "#319678"
  acento-menta: "#74d5a7"
  tinta-oscura: "#10231a"
  texto-principal: "#edf5ef"
  texto-secundario: "#c1d3c8"
  papel-claro: "#e8f1e9"
  aviso: "#e8c47d"
  error: "#ef9999"
  pendiente-fondo: "#4b3e28"
  pendiente-texto: "#f8dfaa"
typography:
  display:
    fontFamily: "Geologica, sans-serif"
    fontSize: "clamp(3.1rem, 8vw, 7.5rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Geologica, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
  body:
    fontFamily: "Geologica, sans-serif"
    fontSize: "1rem"
  label:
    fontFamily: "Geologica, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
rounded:
  lg: "0.5rem"
  xl: "0.75rem"
  2xl: "1rem"
  full: "9999px"
spacing:
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "5": "1.25rem"
  "6": "1.5rem"
  "10": "2.5rem"
components:
  boton-portada:
    backgroundColor: "{colors.acento-menta}"
    textColor: "{colors.tinta-oscura}"
    rounded: "{rounded.lg}"
    height: "3.5rem"
  campo:
    backgroundColor: "{colors.superficie-campo}"
    textColor: "{colors.texto-principal}"
    rounded: "{rounded.2xl}"
    height: "3rem"
  cuenta:
    backgroundColor: "{colors.superficie-carbon}"
    rounded: "{rounded.2xl}"
    padding: "1rem"
  cuenta-seleccionada:
    backgroundColor: "{colors.seleccion-fondo}"
    rounded: "{rounded.2xl}"
    padding: "1rem"
  etiqueta-pendiente:
    backgroundColor: "{colors.pendiente-fondo}"
    textColor: "{colors.pendiente-texto}"
    rounded: "{rounded.full}"
    padding: "0.25rem 0.75rem"
---

# Sistema de diseño: SigueTuCobro

## Overview

**Creative North Star: "Mesa de trabajo serena"**

La interfaz debe sentirse clara y tranquila, con espacio suficiente para leer y actuar. El carbón sostiene la superficie y el verde menta señala las acciones y los estados importantes. Los botones, las tarjetas y los campos tienen una presencia suave y bien definida.

La profundidad deseada usa capas y sombras suaves frecuentes. La implementación actual es principalmente plana: combina superficies y bordes, con sombra en el calendario y un halo en la selección. Las sombras adicionales son una dirección visual acordada, no una capacidad ya implementada.

**Key Characteristics:**
- Contraste legible y jerarquía sencilla.
- Superficies oscuras neutras con acentos verdes.
- Controles redondeados con estados visibles.
- Datos accesibles y composición adaptable.

## Colors

El fondo carbón y las superficies neutras hacen sitio al verde menta sin multiplicar tonos verdes en cada tarjeta. El tema de daisyUI define un primario distinto del menta aplicado directamente a algunos controles; se conservan ambos valores porque el código usa los dos. Los componentes comunes utilizan tokens semánticos `stc` de color, tipografía y espaciado definidos en el CSS global.

### Primary
- **Verde de acción:** primario del tema de daisyUI.
- **Menta claro:** acciones de la portada, foco y énfasis de selección.

### Neutral
- **Carbón de fondo:** lienzo de portada y panel.
- **Carbón de superficie:** filas de cuentas; la selección usa una superficie diferenciada.
- **Carbón de campo y borde definido:** contraste para entradas, selectores y calendario.
- **Texto principal y secundario:** jerarquía de lectura sobre fondos oscuros.
- **Papel claro:** sección editorial de la portada.

### Estados
El ámbar identifica cuentas pendientes; el rojo del tema se reserva para errores. No depender solo del color: acompañar el estado con texto o una señal accesible.

## Typography

Geologica se carga localmente para la interfaz y los títulos. La portada usa un titular amplio; el panel emplea encabezados más contenidos, etiquetas legibles y cifras fáciles de recorrer. Los roles y tamaños observados figuran en el frontmatter.

## Layout

El panel usa una barra lateral de `16rem` en escritorio y navegación plegable en móvil. El contenido principal se centra con un ancho máximo de `72rem` y márgenes que crecen con la pantalla. Los formularios y filtros se reordenan de una a varias columnas; conservar espacio entre grupos relacionados y permitir que los textos largos se ajusten.

## Elevation & Depth

La dirección acordada es usar capas con sombras suaves frecuentes. Hoy las superficies se diferencian sobre todo por color y borde; el calendario desplegable usa una sombra elevada y el indicador de selección un halo pequeño. Al extender el sistema, mantener sombras suaves sin ocultar etiquetas, bordes ni estados de foco.

## Shapes

La escala observada va de esquinas suaves a redondeadas: `0.5rem` en acciones de portada, `0.75rem` en varios botones y navegación, y `1rem` en campos y filas de cuentas. Las etiquetas de estado son de forma píldora y tienen relleno interior.

## Components

### Botones
Priorizar una acción principal reconocible y opciones secundarias discretas. Usar alturas mínimas de `2.75rem` o `3rem` según el componente, esquinas redondeadas y foco visible mediante cambios de borde o superficie, sin anillos decorativos. La portada usa un botón menta claro; el panel también emplea el primario del tema.

### Campos y calendario
Las entradas tienen fondo oscuro diferenciado, borde visible y etiquetas. El campo monetario muestra `$`, usa teclado numérico, separa miles con puntos y comunica caracteres inválidos. El calendario propio presenta mes, navegación y días seleccionables; el foco y los nombres accesibles forman parte del control.

### Cuentas y selección
Las cuentas aparecen como filas redondeadas expandibles. La selección cambia superficie y borde, y añade un punto luminoso con estado accesible. En pantallas táctiles se admite la pulsación sostenida; en escritorio y teclado existe un control de selección.

### Navegación
La opción activa se distingue por superficie y texto. En móvil, el menú se abre desde una barra compacta y se cierra con Escape; mantener nombres claros y foco visible.

### Carga, estados y gráficas
Reservar espacio con skeletons accesibles. Los gráficos deben tener una alternativa textual y describir la fecha representada; el resumen actual filtra por fecha prevista, no por el instante efectivo en que se marcó el pago.

## Do's and Don'ts

### Do:
- **Do** usar superficies contrastadas y etiquetas para distinguir campos y estados.
- **Do** mantener los controles utilizables con teclado y en pantallas pequeñas.
- **Do** combinar una indicación visual con texto o una etiqueta accesible.

### Don't:
- **Don't** volver invisibles los campos sobre el fondo ni eliminar el foco visible.
- **Don't** llenar las tarjetas de tonos verdes que compitan entre sí.
- **Don't** añadir textos decorativos sobre cada título ni representar una fecha prevista como fecha efectiva de pago.
