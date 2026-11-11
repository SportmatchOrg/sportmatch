# Despliegue y recuperación

El frontend se despliega en Vercel, el backend corre como contenedor en Azure App Service y PostgreSQL está en Neon. Azure Blob Storage guarda las fotos. La PR de integración apunta a `dev`; el release a producción se hace integrando a `main`.

| Entorno | Frontend | Backend | PostgreSQL |
| --- | --- | --- | --- |
| Local | Next.js en el puerto 3000 | NestJS en el puerto 3001 | Docker Compose en el puerto 5432 |
| Dev desplegado | Preview de Vercel para `dev` | App Service de dev, imagen con tag `dev` | Rama `dev` de Neon |
| Producción | Production de Vercel para `main` | App Service de prod, imagen con tag `latest` | Neon; la configuración documentada usa la rama `main`. Confirmar el destino efectivo antes del backup. |

## Qué pasa al integrar

1. El [pipeline de GitHub Actions](../.github/workflows/pipeline.yml) ejecuta CI. En un push a `main` publica la imagen del backend aunque no haya cambios en `back/`; en `dev` la publicación depende de la detección de cambios del pipeline.
2. El [workflow del backend](../.github/workflows/cd-back.yml) publica en GHCR con tags de rama y SHA corto, y también `latest` para `main`. Después, el pipeline llama al webhook del App Service del entorno (`AZURE_WEBHOOK_PROD` o `AZURE_WEBHOOK_DEV` en GitHub Actions).
3. Al arrancar, el [entrypoint](../back/docker-entrypoint.sh) aplica las migraciones pendientes con `prisma migrate deploy` y luego inicia NestJS. Si falla la migración, no arranca la nueva versión. Revisar los logs de App Service y confirmar que la API responde.
4. Vercel construye el frontend mediante su integración con Git, en paralelo con el pipeline. Confirmar que ambos despliegues estén listos y correspondan al commit esperado antes de ejecutar el [smoke test](smoke-test.md). Usar las URLs activas de los paneles de Vercel y Azure si la tabla de entornos del smoke test todavía dice «Pendiente».

## Variables por entorno

Usar los archivos [de ejemplo del frontend](../front/.env.example) y [del backend](../back/.env.example) para consultar nombres. Guardar los valores reales solo en el entorno correspondiente. En Vercel, un cambio de variables requiere un nuevo despliegue para que el build lo incorpore.

| Dónde | Variables | Configuración |
| --- | --- | --- |
| Vercel: API | `API_URL`, `NEXT_PUBLIC_API_URL` | `API_URL` es el origen del backend del entorno, sin `/api`. `NEXT_PUBLIC_API_URL=/api` hace que el navegador use el proxy del propio frontend. En local el origen del backend es `http://localhost:3001`. |
| Vercel: integraciones | `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAP_ID`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `NEXT_PUBLIC_AZURE_STORAGE_HOST` | Firebase y VAPID deben coincidir con el backend del entorno. El host de Storage es el hostname público autorizado para mostrar imágenes, sin credenciales. |
| Azure App Service: API y datos | `PORT`, `FRONT_URL`, `DATABASE_URL` | `FRONT_URL` es el origen exacto del frontend, con protocolo y sin barra final. Usar la conexión Neon del entorno con `sslmode=require`; local usa PostgreSQL de Docker. |
| Azure App Service: autenticación y push | `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Cargar la configuración de Firebase y el par VAPID del entorno. |
| Azure App Service: fotos | `AZURE_STORAGE_CONNECTION_STRING`, `AZURE_STORAGE_CONTAINER` | Usar la cadena de la cuenta correspondiente y el contenedor `images`. Ver [configuración de Blob Storage](../back/README.md#image-storage-azure-blob-storage). |
| Azure App Service: funciones opcionales | `KPI_API_KEY`, `SWAGGER_ENABLED`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `AI_TEXT_MODEL`, `AI_FALLBACK_MODEL`, `CF_ACCOUNT_ID`, `CF_API_TOKEN`, `AI_MATCH_DRAFT_DAILY_LIMIT`, `AI_IMAGE_DAILY_LIMIT` | Configurar los proveedores y límites que use el entorno; mantener Swagger apagado en producción. `SEED_DEMO_EMAIL` y `SEED_ADMIN_EMAIL` corresponden a los scripts de seed. |

## Antes del release

1. Revisar las migraciones incluidas en el release y probarlas en dev. Registrar el despliegue anterior de Vercel y el tag por SHA de la imagen anterior de Azure.
2. Antes de integrar a `main`, confirmar en Neon qué proyecto, rama y base corresponden a la configuración efectiva de producción. Preparar un respaldo recuperable de esa base y registrar la hora y la referencia de recuperación. La ejecución y evidencia de esta tarea corresponden a SPO-308. Si no hay respaldo utilizable, postergar el release.
3. Integrar a `main`, revisar ambos despliegues y los logs de migración, y ejecutar el [smoke test](smoke-test.md). Registrar el resultado con el SHA desplegado.

## Promover a un administrador

La persona debe haber iniciado sesión al menos una vez en el entorno de destino. Desde el backend, con `DATABASE_URL` verificada y cargada de forma segura en el proceso, ejecutar:

```bash
npm run admin:promote -- correo@example.com
```

Comprobar que esa cuenta tenga acceso a Moderación. Para promover una cuenta no hace falta correr el seed general, que elimina partidos.

## Cómo volver atrás

1. Verificar que la imagen anterior sea compatible con el esquema actual. Volver a una imagen anterior no revierte las migraciones de Prisma. Si el esquema es incompatible, coordinar una corrección hacia adelante o una recuperación desde el respaldo de Neon. Validar primero la recuperación en un destino aislado y acordar cómo preservar o conciliar las escrituras posteriores al respaldo antes de cambiar la conexión de producción.
2. Para revertir la aplicación, restaurar en Vercel el último despliegue sano del entorno y configurar en Azure App Service la imagen anterior por su tag de SHA desde GHCR. Reiniciar el backend. Evitar usar `latest` para elegir una versión anterior porque ese tag cambia.
3. Repetir el [smoke test](smoke-test.md), registrar las versiones que quedaron activas y revertir o corregir el cambio en Git mediante una PR para que el siguiente deploy no lo vuelva a publicar.
