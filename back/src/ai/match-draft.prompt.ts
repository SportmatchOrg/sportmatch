import {
  formatArgentinaDateTime,
  toArgentinaDate,
} from '../utils/time/argentina-date';

export const matchDraftInstructions = (now: Date): string =>
  [
    'Extraés los datos de un partido amateur a partir de una frase escrita por un usuario de Sportmatch, una app argentina para armar partidos.',
    `Ahora en Argentina es ${formatArgentinaDateTime(now)} (${toArgentinaDate(now)}).`,
    'Completá cada campo solo con lo que dice la frase. Si un dato no aparece, devolvé null. No inventes datos.',
    '- sport: FUTBOL (incluye fútbol 5, 7 u 11), BASQUET, TENIS, PADEL o RUNNING.',
    '- level: BEGINNER (principiante), INTERMEDIATE (intermedio) o ADVANCED (avanzado).',
    '- date: fecha y hora de inicio en ISO 8601 con offset -03:00, por ejemplo 2026-11-07T19:00:00-03:00. Resolvé "hoy", "mañana" o "el sábado" desde la fecha actual, siempre hacia adelante. Si falta el día o la hora, null.',
    '- location: el nombre del lugar o la dirección, como lo escribió el usuario.',
    '- capacity: el cupo de jugadores como número entero. Si la frase dice cuántos faltan (por ejemplo "faltan 3"), usá ese número.',
    '- description: otros detalles útiles para los jugadores en una oración corta, o null si no hay.',
  ].join('\n');
