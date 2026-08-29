# Smoke test post-deploy

## Objetivo

Verificar manualmente que las funciones principales de Sportmatch continúen funcionando después de un deploy y registrar cualquier falla encontrada.

## Cuándo ejecutarlo

- Después de cada deploy a `dev` o producción.
- Antes de la demo, abriendo la aplicación unos minutos antes.
- Sobre una URL de Preview cuando una PR modifica archivos dentro de `front/`.

## Entornos

| Entorno | Frontend | Backend |
| --- | --- | --- |
| Dev | https://sportmatch-git-dev-sportmatch2.vercel.app | https://sportmatch-dev-aqhcazaacaf7e6g0.brazilsouth-01.azurewebsites.net |
| Producción | Pendiente de configuración | Pendiente de configuración |

## Antes de empezar

1. Elegir el entorno que se va a probar y anotar la URL y el commit desplegado.
2. Tener disponible una cuenta de prueba con email y contraseña y una cuenta de Google.
3. Abrir DevTools y mantener visibles las pestañas Network y Console.
4. Usar una ventana de incógnito para comenzar sin una sesión previa.
5. Si no existe un partido con cupo para probar la unión, ejecutar primero el paso 6 y luego volver al paso 5.

La primera solicitud puede tardar varios segundos porque Neon suspende la base de datos por inactividad. No se considera un error si la aplicación responde correctamente después de esperar.

## Datos de la ejecución

| Campo | Valor |
| --- | --- |
| Fecha | |
| Persona que prueba | |
| Entorno | |
| URL | |
| Commit | |

## Checklist

### 1. Acceso sin sesión

- [ ] Abrir la URL del entorno en una ventana de incógnito.
- [ ] Confirmar que la aplicación redirija a `/login`.
- [ ] Confirmar que no se pueda abrir una ruta protegida, por ejemplo `/perfil`.

Resultado esperado: una persona sin sesión permanece en `/login` y no puede acceder a las páginas protegidas.

### 2. Autenticación

- [ ] Iniciar sesión con email y contraseña.
- [ ] Confirmar que la aplicación permita acceder al área autenticada.
- [ ] Cerrar sesión.
- [ ] Iniciar sesión con Google.
- [ ] Confirmar que Firebase no muestre errores de dominio no autorizado.

Resultado esperado: ambos métodos permiten iniciar sesión en el dominio de Vercel.

### 3. Navegación

- [ ] Confirmar que aparezca la barra de navegación.
- [ ] Cambiar entre sus opciones.
- [ ] Confirmar que el ítem correspondiente a la pantalla actual se distinga visualmente.

### 4. Listado de partidos

- [ ] Abrir el listado de partidos.
- [ ] Confirmar que cada partido muestre deporte, fecha, lugar y cupo.
- [ ] Buscar `/partidos` en Network y verificar que la petición de la aplicación responda correctamente.
- [ ] Si el entorno es `dev`, confirmar que la Request URL pertenezca a `sportmatch-dev` en Azure y no al backend productivo.
- [ ] Confirmar que Console no muestre errores de CORS al solicitar `/partidos`.

### 5. Unirse y salir de un partido

- [ ] Abrir el detalle de un partido con cupo disponible.
- [ ] Anotar el cupo antes de unirse.
- [ ] Unirse al partido y confirmar que el cupo disponible disminuya.
- [ ] Salirse del partido y confirmar que el cupo vuelva al valor anterior.

### 6. Crear un partido

- [ ] Crear un partido con deporte, nivel, fecha futura, ubicación y descripción de prueba.
- [ ] Confirmar en Network que la creación responda correctamente.
- [ ] Volver al listado y confirmar que aparezca el partido creado.

### 7. Perfil

- [ ] Abrir el perfil.
- [ ] Confirmar que muestre los datos obtenidos del backend.
- [ ] Confirmar que aparezca la sección `Tus partidos`.
- [ ] Confirmar que el partido creado durante la prueba aparezca donde corresponda.

### 8. Cerrar sesión

- [ ] Cerrar sesión.
- [ ] Confirmar que la aplicación vuelva a `/login`.
- [ ] Intentar abrir nuevamente una ruta protegida y confirmar que redirija a `/login`.
- [ ] Abrir `<URL_DEL_BACKEND>/users/me` sin enviar un bearer token y confirmar que responda `401 Unauthorized`.

Resultado esperado: la sesión queda cerrada y el backend no permite acceder a recursos protegidos sin autenticación.

### 9. Preview de una PR

- [ ] Abrir o actualizar una PR que modifique archivos dentro de `front/`.
- [ ] Confirmar que Vercel genere un deployment de Preview.
- [ ] Abrir la Preview y confirmar que cargue la aplicación.
- [ ] Confirmar que la Preview tenga una URL diferente de la URL fija de `dev`.

## Resultado

Usar `OK`, `Falló` o `No disponible` para cada paso.

| Paso | Estado | Observaciones o evidencia |
| --- | --- | --- |
| Acceso sin sesión | Pendiente | |
| Login con email y contraseña | Pendiente | |
| Login con Google | Pendiente | |
| Navegación | Pendiente | |
| Listado de partidos | Pendiente | |
| Unirse y salir de un partido | Pendiente | |
| Crear un partido | Pendiente | |
| Perfil | Pendiente | |
| Cerrar sesión | Pendiente | |
| Preview de una PR | Pendiente | |

Después de completar el recorrido, copiar en SPO-176 la fecha, el entorno, el commit probado y todos los pasos cuyo estado no sea `OK`.
