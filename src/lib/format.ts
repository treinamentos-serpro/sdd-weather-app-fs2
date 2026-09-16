export function formatDayLabel(date: string, timezone: string) {
  const parsedDate = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Data indisponível';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    timeZone: timezone,
  }).format(parsedDate);
}

export function formatPercentage(value: number | null) {
  if (value === null) {
    return '—';
  }

  return `${new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0,
  }).format(value)}%`;
}
