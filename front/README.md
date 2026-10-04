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
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Clave de Google Maps para la aplicación web. Se crea en Google Cloud Console → APIs y servicios → Credenciales. |
| `NEXT_PUBLIC_GOOGLE_MAP_ID` | ID del mapa asociado al estilo oscuro. Se crea en Google Cloud Console → Google Maps Platform → Map Management. |

Todas son obligatorias. Si falta alguna, la aplicación falla al iniciar con un mensaje que indica cuál (ver `src/lib/env.ts`).

### Configuración de Google Maps

1. En el proyecto de Google Cloud con facturación habilitada, activar **Maps JavaScript API**, **Places API (New)** y **Geocoding API**. La última permite convertir la posición del pin en una dirección.
2. Crear una clave para uso en sitios web y restringirla por **HTTP referrers**: incluir `http://localhost:3000/*` y los dominios concretos del frontend desplegado en Preview/dev y Production. Restringirla también a las tres API anteriores; no dejarla sin restricciones ni usar un comodín para todos los sitios de Vercel.
3. Configurar cuotas diarias para cada API según el presupuesto del proyecto.
4. Crear y publicar un estilo de mapa oscuro, asociarlo a un **Map ID** de tipo JavaScript y colocar ese ID en `NEXT_PUBLIC_GOOGLE_MAP_ID`.
5. Completar las dos variables en `front/.env` para desarrollo local y en los ambientes correspondientes de Vercel. Generar un nuevo despliegue después de cambiar variables en Vercel.

Las variables `NEXT_PUBLIC_` se incluyen en el navegador: la clave no es un secreto. Su protección depende de las restricciones de dominios y API en Google Cloud. No guardar valores reales en el repositorio; `front/.env.example` contiene solo los nombres.

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
