const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const MS_PER_DAY = 86_400_000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function weekdayLabel(date: Date): string {
  return WEEKDAYS[date.getDay()];
}

export function formatMatchDay(fecha: string): string {
  const date = new Date(fecha);
  const days = Math.round((startOfDay(date) - startOfDay(new Date())) / MS_PER_DAY);

  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';

  return `${WEEKDAYS[date.getDay()]} ${date.getDate()}`;
}

export function formatMatchTime(fecha: string): string {
  const date = new Date(fecha);

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
