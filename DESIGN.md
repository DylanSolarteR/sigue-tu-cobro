---
name: SigueTuCobro
description: Gestión y seguimiento de cuentas de cobro.
colors:
  background: "hsl(0 0% 5%)"
  foreground: "hsl(0 0% 100%)"
  card: "hsl(0 0% 3.9%)"
  card-foreground: "hsl(0 0% 98%)"
  primary: "hsl(173 35% 9%)"
  secondary: "hsl(166 40% 8%)"
  accent: "hsl(162 51% 39%)"
  destructive: "hsl(0 62.8% 30.6%)"
  muted: "hsl(0 0% 8%)"
  border: "hsl(0 0% 14.9%)"
  sidebar-active: "#10473A"
typography:
  body:
    fontFamily: "Geologica, sans-serif"
  label:
    fontFamily: "Geologica, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
rounded:
  sm: "calc(0.5rem - 4px)"
  md: "calc(0.5rem - 2px)"
  lg: "0.5rem"
  xl: "0.75rem"
spacing:
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  6: "1.5rem"
  8: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  input:
    rounded: "{rounded.md}"
    padding: "0.25rem 0.75rem"
    height: "2.25rem"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
---

# Design System: SigueTuCobro

## Overview

**Creative North Star: "Un espacio de trabajo financiero claro y sobrio"**

La interfaz combina una base oscura con verde financiero profundo para presentar la información de gestión con claridad. La dirección acordada es moderna y dinámica, sin perder la sobriedad propia de un espacio de trabajo financiero.

Las capas sutiles, las sombras discretas y las formas suaves buscan transmitir claridad y confianza. La portada admite un tratamiento más expresivo mediante degradados e iluminación; el panel prioriza la lectura de datos y la ejecución de tareas.

**Key Characteristics:**
- Superficies oscuras y texto claro.
- Verde profundo para acciones y estados, con un acento más luminoso.
- Geologica como tipografía local de la aplicación.
- Controles compactos y contenedores de bordes suaves.

## Colors

La paleta se apoya en negros cercanos y verdes oscuros, con un verde más vivo para llamar la atención.

### Primary
- **Verde financiero profundo** (`primary`): fondo del botón principal y elementos destacados oscuros.
- **Verde de acento** (`accent`): referencias destacadas, interacción y bordes atenuados de tablas.

### Secondary
- **Verde de superficie** (`secondary`): tarjetas de indicadores, encabezados de tabla y acciones secundarias.

### Neutral
- **Fondo carbón** (`background`) y **blanco** (`foreground`): base y texto general.
- **Tarjeta oscura** (`card`) y **blanco suave** (`card-foreground`): superficies de tarjeta y su texto.
- **Superficie atenuada** (`muted`) y **borde oscuro** (`border`): separación de áreas y controles.
- **Verde de navegación activa** (`sidebar-active`): sección seleccionada en el panel lateral.
- **Rojo destructivo** (`destructive`): acciones destructivas.

Los valores semánticos provienen de `src/styles/globals.css`; el verde activo de navegación está definido directamente en `SidebarDashboard.tsx`. Los colores de gráficos tienen su propia escala en la hoja global.

## Typography

La aplicación carga **Geologica** desde un archivo local en el layout raíz. Las jerarquías se construyen con tamaño y peso; el botón base usa texto de 0.875rem y peso 500. Los títulos de tarjetas de indicadores usan 1.25rem, y sus cifras 3rem. La portada utiliza un título de 2.25rem que aumenta a 4.5rem en `md`.

## Layout

El panel organiza la navegación lateral y un área principal centrada con ancho máximo de 70rem. El resumen presenta indicadores en una columna y pasa a cuatro columnas en `md`; las tarjetas emplean espacios internos de 1.5rem y las tablas, 2rem en su contenedor exterior. Los espacios recurrentes van de 0.5rem a 2rem.

La portada cambia de una composición centrada a una alineada a la izquierda en `md`; la ilustración y la acción principal aparecen en `2xl`. La propia portada advierte que la aplicación todavía no está optimizada para móviles: es una limitación actual y está previsto corregirla, no una regla de diseño permanente.

## Elevation & Depth

La profundidad combina superficies de distintos tonos con sombras discretas en botones, campos y tarjetas. La portada añade un resplandor verde difuso y un borde iluminado interactivo; este efecto pertenece a esa superficie y no es un requisito de todos los componentes.

## Shapes

La base de radios es 0.5rem: los controles usan el radio medio derivado (6px), las tarjetas generales usan 0.75rem y la navegación activa emplea esquinas más redondeadas. Los bordes discretos separan campos, tarjetas y tablas de las superficies cercanas.

## Components

### Buttons
El botón base mide 2.25rem de alto, tiene relleno horizontal de 1rem, radio medio y texto de peso 500. Existen variantes principal, secundaria, destructiva, contorno, transparente y enlace, además de tamaños pequeños, grandes y de icono. Los estados incluyen cambios de color al pasar el cursor, anillo de foco visible y opacidad reducida cuando está deshabilitado.

### Cards / Containers
Las tarjetas generales usan superficie oscura, borde, sombra y radio de 0.75rem; su cabecera y contenido emplean 1.5rem de relleno. Las tarjetas de indicadores sustituyen esa superficie por verde secundario, eliminan el borde y centran el valor destacado.

### Inputs / Fields
Los campos y selectores miden 2.25rem de alto, tienen fondo transparente, borde oscuro, radio medio y sombra pequeña. El foco muestra un anillo; el estado deshabilitado reduce la opacidad. Los campos usan texto de 1rem, reducido a 0.875rem desde `md`.

### Navigation
El panel lateral flotante puede contraerse a iconos. La sección activa usa una superficie verde y esquinas amplias; las opciones inactivas aparecen atenuadas y recuperan brillo al pasar el cursor. La navegación de portada utiliza fondo con desenfoque y menú plegable.

### Tables
Las tablas de datos usan encabezado verde secundario, bordes verdes atenuados y realce al pasar el cursor por una fila. Incluyen un mensaje centrado para la ausencia de registros y controles de paginación.

## Do's and Don'ts

### Do:
- **Do** reutilizar los colores semánticos y los componentes existentes para mantener coherencia.
- **Do** distinguir la navegación activa y conservar los estados de foco y deshabilitado.
- **Do** mantener el contenido operativo legible sobre las superficies oscuras.

### Don't:
- **Don't** convertir la limitación móvil actual en un requisito permanente.
- **Don't** extender automáticamente los efectos luminosos de la portada a todo el panel.
