# Instrucciones de GitHub Copilot — Sportmatch

Aplicá estas reglas en el chat, las sugerencias de código y el code review. `AGENTS.md` contiene el contexto completo del producto y es la referencia general del repositorio.

## Contexto del repositorio

Sportmatch es una aplicación web con dos aplicaciones independientes en la raíz:

- `front/`: Next.js 16 con App Router, React 19, TypeScript y Tailwind CSS 4.
- `back/`: NestJS 11, Prisma 7 y TypeScript.
- Base de datos: PostgreSQL 18 mediante `docker-compose.yml`.
- Runtime: Node.js 24.
- Package manager: npm exclusivamente.

No uses convenciones de la estructura anterior. No sugieras `frontend/`, `backend/`, `apps/`, `packages/`, Turbo, npm workspaces, Yarn ni pnpm. El `package.json` raíz solo coordina scripts y Husky; `front/` y `back/` tienen sus propias dependencias y lockfiles.

## Backend: cuatro capas obligatorias

Cada resource debe contener:

```text
<resource>.module.ts
<resource>.controller.ts
<resource>.service.ts
<resource>.repository.ts
```

Puede incluir DTOs para validar entradas. Respetá este flujo:

```text
HTTP → controller → service → repository → PrismaService → PostgreSQL
```

- **module:** compone y registra el resource.
- **controller:** maneja HTTP y DTOs; delega al service y no contiene lógica de negocio.
- **service:** contiene reglas de negocio y excepciones; no inyecta `PrismaService`.
- **repository:** única capa del resource autorizada a inyectar y usar `PrismaService`.

Tomá `back/src/users/` como referencia. Al sugerir comandos de Nest, usá `--no-spec`; el repository se agrega manualmente si el generador no lo crea.

## Tests

Por ahora no crear tests:

- No generar archivos `.spec.ts`.
- Usar siempre `--no-spec` para resources, controllers y services.
- No agregar suites ni infraestructura de testing salvo que un ticket lo pida explícitamente.
- No eliminar ni alterar el comando existente `jest --passWithNoTests`.

## Prisma 7

No aplicar ejemplos ni convenciones de Prisma 6.

La configuración real es:

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../src/generated/prisma"
  moduleFormat = "cjs"
}
```

Reglas obligatorias:

- El cliente generado vive en `back/src/generated/prisma`.
- Desde `back/src/<resource>/`, importar `Prisma` y sus tipos desde `../generated/prisma/client`.
- `PrismaService` importa `PrismaClient` desde `../generated/prisma/client`.
- No importar `PrismaClient`, `Prisma` ni tipos generados desde `@prisma/client`.
- No editar archivos generados manualmente.
- Crear `PrismaClient` con `@prisma/adapter-pg`.
- Mantener datasource, migraciones y seed configurados en `back/prisma.config.ts`; el script de seed vive en `back/prisma/seed.ts`.
- Ejecutar la generación del cliente antes del build después de cambiar el schema.
- Cambiar el schema únicamente mediante migraciones de Prisma.

## Frontend

- Usar App Router en `front/src/app/`; no sugerir Pages Router.
- Respetar el `front/AGENTS.md` generado por la versión instalada de Next.js.
- Mantener TypeScript estricto y evitar `any` sin justificación.
- Reutilizar componentes y estilos existentes antes de crear otros.
- No hardcodear configuración de Firebase ni secretos.

## Puertos

- Frontend: `3000`.
- Backend: `3001`.
- PostgreSQL: `5432`.

## npm y validación

Usar solo comandos npm. Comandos habituales desde la raíz:

```bash
npm --prefix front ci
npm --prefix back ci
npm run verify
```

No aprobar ni recomendar mergear una PR con checks rojos. No corregir automáticamente problemas ajenos al alcance del ticket.

## Git y trazabilidad

- Crear ramas desde `dev` y abrir PRs hacia `dev`.
- Usar IDs de Linear `SPO-###`, no IDs heredados del onboarding.
- Ramas: `feature/SPO-###-descripcion`, `fix/SPO-###-descripcion` o `chore/SPO-###-descripcion`.
- Commits: `tipo(SPO-###): mensaje`.
- Incluir `SPO-###` en el título de la PR.

## Code review

Al revisar una PR, priorizá:

1. Bugs y casos borde.
2. Incumplimiento de los criterios del ticket.
3. Seguridad: secretos, validación de inputs y exposición de datos.
4. Arquitectura: separación controller/service/repository y acceso exclusivo a Prisma desde repositories.
5. Uso correcto de Prisma 7 y del cliente generado.
6. Mantenibilidad y cambios fuera de alcance.

Clasificá hallazgos como `BLOCKER`, `MAJOR`, `MINOR` o `NIT`. Sé específico, citá `archivo:línea`, explicá el impacto y sugerí una corrección concreta. Cerrá con un resumen breve y un veredicto. Evitá llenar la revisión con preferencias de estilo que ESLint ya controla.

Los asistentes interactivos implementan solo cuando una persona lo pide. Los workflows automáticos revisan y reportan; no escriben ni mergean código por cuenta propia.
