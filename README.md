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

Las carpetas `front/` y `back/` se crean durante el setup correspondiente de cada aplicación.

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
postgres://root:root@localhost:5432/sportmatch
```

Las credenciales incluidas en `docker-compose.yml` son exclusivamente para desarrollo local.

## Frontend

Una vez creado el frontend:

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

Una vez creado el backend:

```bash
cd back
npm install
npm run start:dev
```

La API estará disponible en:

```text
http://localhost:3001
```

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
