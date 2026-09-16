import type { Unit } from '../types/weather';

export function convertTemperatureFromCelsius(temperatureC: number | null, unit: Unit) {
  if (temperatureC === null || !Number.isFinite(temperatureC)) {
    return null;
  }

  if (unit === 'fahrenheit') {
    return (temperatureC * 9) / 5 + 32;
  }

  return temperatureC;
}

export function unitLabel(unit: Unit) {
  return unit === 'celsius' ? '°C' : '°F';
}

export function formatTemperature(temperatureC: number | null, unit: Unit) {
  const temperature = convertTemperatureFromCelsius(temperatureC, unit);

  if (temperature === null) {
    return '—';
  }

  const value = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(temperature);

  return `${value}${unitLabel(unit)}`;
}
