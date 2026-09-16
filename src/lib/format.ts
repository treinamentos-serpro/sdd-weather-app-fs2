const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function parseLocalDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function getDayLabel(date: string, index: number) {
  if (index === 0) {
    return 'Hoje';
  }

  if (index === 1) {
    return 'Amanhã';
  }

  return weekdays[parseLocalDate(date).getDay()];
}

export function getShortDate(date: string) {
  const parsedDate = parseLocalDate(date);
  return `${parsedDate.getDate()} ${months[parsedDate.getMonth()]}`;
}

export function formatDayLabel(date: string, timezone: string) {
  const parsedDate = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Data indisponível';
  }

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      timeZone: timezone,
    }).format(parsedDate);
  } catch {
    return 'Data indisponível';
  }
}

export function formatPercentage(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return '—';
  }

  return `${new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0,
  }).format(value)}%`;
}
