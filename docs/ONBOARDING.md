

# docs/ONBOARDING.md

## 1. Qué es SportMatch

SportMatch es una aplicación web responsiva que conecta personas para practicar deportes. Incluye autenticación, perfiles, creación y descubrimiento de partidos, solicitudes de participación y sistema de ratings. El MVP cubre los requisitos RF-01 a RF-06 definidos en [AGENTS.md](../AGENTS.md).

## 2. Requisitos previos

- Node.js 24 (ver `.nvmrc`)
- npm incluido con Node.js
- Docker y Docker Compose para la base de datos
- Git configurado con usuario y email

## 3. Setup paso a paso

Clona el repositorio y desde la raíz ejecuta:

nvm use
npm install
npm --prefix front ci
npm --prefix back ci
docker compose up -d db

Para desarrollo en segundo plano:

npm --prefix front run dev
npm --prefix back run start:dev

La base de datos PostgreSQL quedará disponible en `localhost:5432`. El frontend escucha en `http://localhost:3000` y el backend en `http://localhost:3001`.

## 4. Tests y lint

Ejecuta la verificación completa antes de hacer push:

npm run verify

Este comando ejecuta lint, tests y builds de ambos proyectos. Actualmente el backend usa Jest con `--passWithNoTests`, por lo que no hay suites de test activas. No crear archivos `.spec.ts` ni agregar infraestructura de testing sin un ticket explícito.

## 5. Flujo de trabajo

- `main` es la rama de entrega; `dev` es de integración.
- Crea ramas desde `dev` y abre PRs hacia `dev`. Nunca hagas push directo a `main` o `dev`.
- Formato de ramas: `feature/SPO-###- descripcion`, `fix/SPO-###- descripcion` o `chore/SPO-###- descripcion`.
- Commits: `tipo(SPO-###): mensaje`, ejemplo: `feat(SPO-150): agregar resource de deportes`.
- Incluye `SPO-###` en el título de la PR y mantén un solo objetivo por PR.
- La Definition of Done (DoD) y los criterios de aceptación están en [AGENTS.md §6](../AGENTS.md#6-tests) y el checker automático en `.github/workflows/dod-checker.yml`.

## 6. Mapa del código

- `front/`: Aplicación Next.js 16 con App Router, React 19, Tailwind CSS 4.
- `back/`: Backend NestJS 11 con TypeScript.
  - `prisma/`: Schema, migraciones y seed de Prisma 7.
  - `src/generated/prisma`: Cliente generado por Prisma (no editable manualmente).
  - `src/<resource>/`: Módulos de negocio con las cuatro capas (module, controller, service, repository).
  - Recursos existentes: `users`, `matches`, `join-requests`, `ratings`, `sports`, `notifications`, `reports`, `reminders`, `user-blocks`, `push-subscriptions`, `storage`, `auth`, `firebase`, `config`, `health`, `kpis`, `ai`, `utils`.
- `docker-compose.yml`: Servicios de PostgreSQL 18 y backend.
- `package.json` raíz: Coordina comandos de ambas aplicaciones y configura Husky.
- `.github/`: Workflows de CI, automatizaciones y plantillas de PR.

## 7. Primer día: primera contribución

1. Configura el entorno con el setup de la sección 3.
2. Crea una rama desde `dev`:
   ```bash
   git checkout dev
   git pull
   git checkout -b feature/SPO-EXEMPLO-primera-contribucion
   ```
3. Implementa un cambio pequeño, por ejemplo, agregar un campo en el schema de Prisma:
   - Edita `back/prisma/schema.prisma`.
   - Ejecuta en `back/`:
     ```bash
     npm run db:generate
     npm run db:migrate
     ```
4. Haz commit con el formato correcto:
   ```bash
   git add .
   git commit -m "feat(SPO-EXEMPLO): agregar campo de ejemplo"
   ```
5. Sube la rama y abre una PR hacia `dev` siguiendo `.github/PULL_REQUEST_TEMPLATE.md`.

## 8. Problemas comunes

- **Error al generar Prisma client**: Asegúrate de estar en `back/` y de haber ejecutado `npm run db:generate` después de cambiar el schema.
- **CORS rechazado en el frontend**: El backend acepta `http://localhost:3000` como origen por defecto. Verifica la variable `FRONT_URL` en `back/.env`.
- **Puertos ocupados**: Asegúrate de que los puertos 3000, 3001 y 5432 estén libres. Usa `lsof -i :3000` para verificar.
- **Base de datos no está lista**: Espera a que el healthcheck de Docker marque `healthy` antes de ejecutar comandos que requieran DB.
- **Error de TypeScript en el backend**: Recuerda que los tipos de Prisma se importan desde `../generated/prisma/client` y no desde `@prisma/client`.
- **No hay tests que correr**: El proyecto no crea archivos `.spec.ts`. Usa `npm run verify` para lint y builds.
- **No se puede hacer push a main**: Si intentas push a main, recibiras error. Siempre trabaja en ramas de feature y abre PRs hacia `dev`.

<!-- TODO: verificar si hay comandos de lint específicos para cada carpeta -->
