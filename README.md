# Sportmatch

Sportmatch es una aplicación web full-stack desarrollada con una arquitectura separada en frontend, backend y base de datos.

El proyecto utiliza **Next.js** para el frontend, **NestJS** para el backend y **PostgreSQL** como base de datos.

## Requisitos

Para trabajar con el proyecto es necesario tener instalado:

* Node.js 24
* Docker y Docker Compose
* Git
* GitHub CLI (`gh`)

La versión de Node utilizada por el proyecto está definida en `.nvmrc`.

Si utilizás NVM:

```bash
nvm use
```

Podés verificar la versión activa con:

```bash
node -v
```

Debe devolver una versión `v24.x`.

## Instalación inicial

Después de clonar el repositorio, instalar las dependencias desde la raíz:

```bash
npm install
```

Este comando instala Husky y activa el hook `pre-push`. Antes de cada push, el hook ejecuta el lint, los tests y el build del frontend y del backend.

## Estructura del proyecto

La estructura principal del repositorio es:

```text
sportmatch/
├── front/
├── back/
├── docker-compose.yml
├── .editorconfig
├── .gitignore
├── .nvmrc
└── README.md
```

* `front/`: aplicación frontend desarrollada con Next.js.
* `back/`: API backend desarrollada con NestJS.
* `docker-compose.yml`: configuración de PostgreSQL para desarrollo local.

## Base de datos

Para levantar PostgreSQL:

```bash
docker compose up -d db
```

Para verificar el estado del contenedor:

```bash
docker compose ps
```

El servicio `db` debe aparecer como `healthy`.

### Conexión local

```text
postgresql://root:root@localhost:5432/sportmatch?schema=public
```

Las credenciales incluidas en `docker-compose.yml` son exclusivamente para desarrollo local.

### Variables de entorno del backend

El backend utiliza las siguientes variables de entorno:

- `PORT`: puerto en el que se ejecuta la API.
- `FRONT_URL`: origen permitido para las solicitudes del frontend.
- `DATABASE_URL`: conexión a PostgreSQL.
- `FIREBASE_PROJECT_ID`: identificador del proyecto de Firebase.
- `FIREBASE_CLIENT_EMAIL`: correo de la cuenta de servicio de Firebase.
- `FIREBASE_PRIVATE_KEY`: clave privada de la cuenta de servicio de Firebase.

La base de datos utilizada depende del entorno:

| Entorno | Rama de Git | Base de datos |
| --- | --- | --- |
| Desarrollo local | Rama de trabajo | PostgreSQL de `docker-compose.yml` |
| Desarrollo desplegado | `dev` | Branch `dev` de Neon |
| Producción | `main` | Branch `main` de Neon |

En los entornos desplegados, `DATABASE_URL` debe configurarse con la connection string de la branch correspondiente de Neon e incluir `sslmode=require`.

Las credenciales reales deben configurarse como secretos del entorno y nunca deben guardarse en el repositorio.

## Prisma y migraciones

Prisma está configurado dentro de `back/`.

Para levantar la base de datos:

```bash
docker compose up -d db
```

Luego, desde `back/`, ejecutar las migraciones y generar el cliente de Prisma:

```bash
cd back
npm run db:migrate
```

Finalmente, iniciar el backend:

```bash
npm run start:dev
```

El flujo de desarrollo es:

```text
docker compose up -d db
        ↓
npm run db:migrate
        ↓
npm run start:dev
```

Scripts disponibles para Prisma:

```bash
npm run db:migrate
npm run db:deploy
npm run db:generate
npm run db:seed
npm run db:studio
```

## Frontend

Para instalar las dependencias e iniciar el frontend:

```bash
cd front
npm install
npm run dev
```

La aplicación estará disponible en:

```text
http://localhost:3000
```

## Backend

Para instalar las dependencias:

```bash
cd back
npm install
```

Para iniciar el backend en modo desarrollo:

```bash
npm run start:dev
```

La API estará disponible en:

```text
http://localhost:3001
```

### Imagen Docker del backend

La imagen de producción del backend se publica en:

```text
ghcr.io/sportmatchorg/sportmatch/back:latest
```

### Pipeline de GitHub Actions

- Una PR a `dev` o `main` ejecuta CI, DoD, traductor y QA Review; no publica imágenes.
- Un push a `dev` ejecuta CI, publica la imagen con tag `dev` si cambió `back/` y ejecuta el Curador de contexto.
- Un push a `main` ejecuta CI y publica la imagen con tag `latest` si cambió `back/`.
- Un push a otra rama no ejecuta Pipeline; los workflows programados continúan ejecutándose por separado.

## Puertos

| Servicio   | Puerto |
| ---------- | -----: |
| Frontend   |   3000 |
| Backend    |   3001 |
| PostgreSQL |   5432 |

## Desarrollo

La rama principal de desarrollo es `dev`.

Todo nuevo trabajo debe realizarse en una rama creada a partir de `dev` y luego integrarse mediante un Pull Request hacia `dev`.

```bash
git checkout dev
git pull
git checkout -b <rama-del-ticket>
```

No se realizan pushes directos a `main` ni a `dev`.
