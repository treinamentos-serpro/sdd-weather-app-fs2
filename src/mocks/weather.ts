import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    country: 'Brasil',
    region: 'São Paulo',
    latitude: -23.55,
    longitude: -46.63,
  },
  timezone: 'America/Sao_Paulo',
  currentDate: '2026-09-16T12:00',
  current: {
    temperatureC: 22.4,
    relativeHumidity: 68,
    windSpeedKmh: 11.2,
    surfacePressureHpa: 1015.7,
    precipitationMm: 0,
    weatherCode: 2,
  },
  forecast: [
    {
      date: '2026-09-16',
      temperatureMinC: 16.2,
      temperatureMaxC: 25.1,
      precipitationMm: 0,
      precipitationProbability: 12,
      weatherCode: 2,
    },
    {
      date: '2026-09-17',
      temperatureMinC: 17.1,
      temperatureMaxC: 26,
      precipitationMm: 1.4,
      precipitationProbability: 46,
      weatherCode: 61,
    },
    {
      date: '2026-09-18',
      temperatureMinC: 18,
      temperatureMaxC: 27.4,
      precipitationMm: 3.2,
      precipitationProbability: 72,
      weatherCode: 63,
    },
    {
      date: '2026-09-19',
      temperatureMinC: 17.8,
      temperatureMaxC: 24.8,
      precipitationMm: 0,
      precipitationProbability: 18,
      weatherCode: 1,
    },
    {
      date: '2026-09-20',
      temperatureMinC: 19.3,
      temperatureMaxC: 28.2,
      precipitationMm: 0,
      precipitationProbability: 8,
      weatherCode: 0,
    },
  ],
};
