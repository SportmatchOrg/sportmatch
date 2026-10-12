# Seed de demo

`seed-demo.ts` carga datos para mostrar el MVP sin tocar datos reales.

## Qué crea

- 8 usuarios `@demouser.sportmatch.com` con ciudad, nivel y deportes.
- 10 partidos futuros en Pilar y CABA: los 5 deportes, los 3 niveles y 2 partidos llenos.
- 3 partidos jugados con calificaciones, una falta confirmada y una baja tarde.
- Solicitudes pendientes y 6 notificaciones para la cuenta de `SEED_DEMO_EMAIL`, que es el anfitrión de la demo.

El anfitrión organiza 2 partidos, está anotado en otros 2 y jugó los 3 partidos pasados. Si `SEED_DEMO_EMAIL` no está definida, o esa cuenta todavía no entró nunca a la app, el anfitrión pasa a ser el usuario demo Nicolás Romero. En ese caso, entrá una vez con la cuenta y volvé a correr el seed.

## Cómo correrlo

```bash
DATABASE_URL=… SEED_DEMO_EMAIL=… npm run db:seed:demo
```

Si la base de destino es la del `.env`, alcanza con `npm run db:seed:demo`.

## Por qué es seguro en producción

- Solo escribe usuarios `@demouser.sportmatch.com` y filas con id `demo-…`.
- Antes de escribir, imprime cuántas filas demo hay y cuántas va a escribir.
- Corre en una sola transacción que cuenta las filas que no son de la demo antes y después. Si cambia algún número, se deshace todo y no se guarda nada.
- Nunca modifica el usuario del anfitrión, sus partidos propios ni sus notificaciones reales.

Es idempotente: cada corrida recalcula las fechas respecto de hoy y deja los partidos demo como en el plan. Sirve para resetear la demo después de un ensayo. Si un usuario real se sumó a un partido demo, esa participación se borra al volver a correrlo.
