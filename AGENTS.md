# SIGUE TU COBRO

Aplicación web para empresarios colombianos que permite gestionar cuentas de cobro, permitiendo el registro de acreedores, clientes, cuentas de cobro e items.

## Stack

- Lenguaje: Typescript.
- Framework / runtime: Next.js.
- Base de datos: PostgreSQL con Singlestore y Drizzle ORM
- Tests: Vitest para lógica y componentes, y Playwright para flujos de usuario (End-to-End).
- Otras herramientas: tRPC, Clerk, Zod.

## Comandos

- `pnpm run dev` — arranca el servidor en local
- `[comando test]` — ejecuta los tests (deben pasar antes de cada
  commit), aun no implementado, cuando se haga la implementacion de los tests usa el comando adecuado.
- `pnpm run build` — compila para producción

## Estructura del proyecto

- `/` — raiz del proyecto, contiene archivos de configuracion y variables de ambiente.
- `src/` — codigo del proyecto, tiene subcarpetas segun dominio, asi como variables de entorno y codigo middleware.
  - `src/actions` - Controladores de peticiones para las distintas entidades de la base de datos, se comunica con la api de la carpeta de server para hacer las llamadas a la base de datos y con base a ello devuelve la response.
  - `src/app` - Maneja la estructura de carpetas para el enrutamiento y dentro sus respectivos archivos de cada pagina, basicamente es el frontend.
  - `src/components` - Almacena componentes usados en el frontend.
  - `src/fonts` - Fuentes de texto
  - `src/hooks` - Custom hooks
  - `src/lib` - Archivos con funciones de utilidad.
  - `src/media` - Archivos multimedia como img o svg.
  - `src/server` - El backend, implementando tRPC para tipado a nivel de proyecto, dentro de la carpeta se encuentran las carpetas de la api y la base de datos, en la api se definen los routers para cada entidad y sus debidas queries, en la base de datos se definen la conexion y schemas para las entidades.
  - `src/styles` -
  - `src/trpc` - Estilos de css.
  - `src/types` - Tipos de typescript.
- `public/` — contiene iconos como el favicon.

## Convenciones

- Estilo de nombres: constantes en MAYUSCULAS y variables en minusculas, los espacios con \_, funciones en cammelCase.
- Maneja los tests por cada dominio, Frontend y Backend, cada uno en la carpeta de app/tests y server/tests respectivamente, si no existe alguna de estas carpetas, crealas. Separa los tests por su tipo, ej: tests unitarios, tests de integracion, etc.
- Patrones a seguir:
  - Validar toda entrada del usuario antes de usarla, tanto en el frontend como en el backend.
  - Sigue patrones de codigo limpio, si un trozo de codigo no es lo suficientemente claro, explicalo con comentario.
  - Sigue el patron Result, no lo implementes en lo que ya esta, pero si en lo nuevo o los cambios que hagas, pero procura asegurar mantenibilidad para refactorizar lo ya hecho en un futuro implementando este patrón.
  - Manten las buenas practicas de UI/UX para asegurar una interfaz acorde a los estandares y amigable con la experiencia del usuario.

## No hagas

- No instalar dependencias sin avisar.
- Todas las SECRET deben quedar almacenadas en variables de entorno, nada de SECRETs hardcodeadas.
- No subir archivos `.env*` al repositorio.
- No usar `any` en TypeScript sin justificarlo.

## Flujo de trabajo

- Antes de una tarea no trivial, propón un plan y espera mi OK.
- Maneja un flujo basado en TDD al implementar cambios, basicamente, planifica y genera los tests primero y luego implementas el codigo.
- Una tarea a la vez; al terminar, dime qué cambiaste para que lo revise.
- Si no estás seguro al 80%, pregunta. No inventes.
- Siempre usa pnpm como gestor de paquetes.
- Flujo de Trabajo con Git Worktrees:
  - Todo cambio o tarea asignada debe realizarse en un `git worktree` físico independiente y en su propia rama de feature (`feature/nombre-corto`).
  - Restricción de Seguridad (Antes de codificar): Antes de crear el worktree, modificar archivos o ejecutar herramientas, debes presentar un resumen de lo que vas a cambiar y solicitar mi aprobación explícita.
  - Fase de Integración: Una vez completado y probado el cambio dentro del worktree, realiza el `merge` hacia la rama `dev`.
  - Limpieza: Tras un merge exitoso, elimina tanto la rama local de la feature como su directorio de worktree asociado (`git worktree remove`).
- Al hacer un commit sigue las practicas de la skill de git-commit

## Documentación

- Sigue las directrices del archivo ~/spec_template/README.md ya que busco usar SDD para el flujo de trabajo.

- Si necesitas ver la documentación de herramientas para guiarte en alguna implementacion, usa context7.

## Engram Memory

You have access to Engram as an MCP server. Use it to maintain persistent memory.

### On session start

Search Engram for context relevant to the current task:

    search
      query: "<summary of what the user is asking about>"
      limit: 5

Include relevant results in your working context.

### During the session

When important work is done, store it:

    create_conversation
      title: "<what was discussed>"
      agent_id: "claude-code"
      tags: ["<project-name>", "<topic>"]

    append_messages
      conversation_id: "<id>"
      messages:
        - role: "user"
          content: "<what the user asked>"
        - role: "assistant"
          content: "<what you did and why>"

### What to store

- Decisions and their reasoning
- Bug investigations and resolutions
- User preferences and workflow
- Architecture discussions
