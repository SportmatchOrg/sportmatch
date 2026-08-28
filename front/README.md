# SportMatch — Frontend

Aplicación web de SportMatch, desarrollada con **Next.js** (App Router) y **Tailwind CSS**.
Consume la API de `back/` y usa **Firebase Authentication** para el login.

## Requisitos

* Node.js 24 (definido en `.nvmrc` en la raíz del repositorio)
* El backend corriendo, si vas a usar pantallas que traen datos

## Variables de entorno

Copiar el archivo de ejemplo y completarlo:

```bash
cp .env.example .env
```

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | URL base de la API del backend. En local, `http://localhost:3001`. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Credenciales del proyecto de Firebase. Se obtienen en la consola de Firebase, en la configuración de la app web. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | |

Todas son obligatorias. Si falta alguna, la aplicación falla al iniciar con un mensaje que indica cuál (ver `src/lib/env.ts`).

## Desarrollo

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Levanta el servidor de desarrollo. |
| `npm run build` | Genera el build de producción. |
| `npm run start` | Sirve el build de producción. |
| `npm run lint` | Ejecuta ESLint. |

El hook `pre-push` de Husky corre `npm run verify` desde la raíz, que ejecuta el lint, los tests y el build del frontend y del backend.

## Estructura

```text
front/
├── public/              # Imágenes estáticas
└── src/
    ├── app/             # Rutas (App Router)
    │   ├── (app)/       # Pantallas con sesión iniciada
    │   ├── (auth)/      # Login, registro y recupero de contraseña
    │   ├── layout.tsx   # Layout raíz: fuentes, metadata y AuthProvider
    │   └── page.tsx     # Raíz: redirige según haya sesión o no
    ├── components/      # Componentes de UI
    ├── context/         # Contextos de React (auth)
    ├── hooks/           # Hooks propios
    ├── lib/             # Cliente de API, Firebase y utilidades
    └── types/           # Tipos compartidos
```

Las carpetas entre paréntesis son *route groups* de Next: agrupan rutas para compartir un layout sin aparecer en la URL. Por eso la pantalla de perfil vive en `app/(app)/perfil/` y su URL es `/perfil`.

## Autenticación

`AuthProvider` (`src/context/auth-context.tsx`) escucha el estado de sesión de Firebase y lo expone con el hook `useAuth()`.

* `src/app/page.tsx` redirige a `/login` o a la aplicación según haya sesión.
* `src/app/(app)/layout.tsx` redirige a `/login` a quien entre sin sesión a una ruta privada.

Esa verificación del frontend es de experiencia de usuario: evita mostrar pantallas vacías. La protección real de los datos está en el backend, que valida el token de Firebase en cada request. `apiFetch` (`src/lib/api.ts`) adjunta ese token automáticamente.

## Diseño

Los lineamientos visuales (colores, tipografía y espaciado) están documentados en `DESIGN.md`.
