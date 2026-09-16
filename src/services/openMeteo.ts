import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const FORECAST_DAYS = 5;

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

interface OpenMeteoResponse {
  timezone?: unknown;
  current?: {
    time?: unknown;
    temperature_2m?: unknown;
    relative_humidity_2m?: unknown;
    wind_speed_10m?: unknown;
    surface_pressure?: unknown;
    precipitation?: unknown;
    weather_code?: unknown;
  } | null;
  daily?: {
    time?: unknown;
    temperature_2m_min?: unknown;
    temperature_2m_max?: unknown;
    precipitation_sum?: unknown;
    precipitation_probability_max?: unknown;
    weather_code?: unknown;
  } | null;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function getDailyValue(values: unknown[] | null, index: number): number | null {
  return values ? nullableNumber(values[index]) : null;
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function mapCurrent(current: NonNullable<OpenMeteoResponse['current']>): CurrentWeather {
  return {
    temperatureC: nullableNumber(current.temperature_2m),
    relativeHumidity: nullableNumber(current.relative_humidity_2m),
    windSpeedKmh: nullableNumber(current.wind_speed_10m),
    surfacePressureHpa: nullableNumber(current.surface_pressure),
    precipitationMm: nullableNumber(current.precipitation),
    weatherCode: nullableNumber(current.weather_code),
  };
}

function mapForecast(daily: NonNullable<OpenMeteoResponse['daily']>): ForecastDay[] {
  if (
    !isArray(daily.time) ||
    !isArray(daily.temperature_2m_min) ||
    !isArray(daily.temperature_2m_max) ||
    !isArray(daily.precipitation_sum) ||
    !isArray(daily.precipitation_probability_max) ||
    !isArray(daily.weather_code) ||
    daily.time.length < FORECAST_DAYS
  ) {
    throw new WeatherServiceError('A resposta da previsão está incompleta.');
  }

  return daily.time.slice(0, FORECAST_DAYS).map((date, index) => {
    if (typeof date !== 'string' || date.length === 0) {
      throw new WeatherServiceError('A resposta da previsão está incompleta.');
    }

    return {
      date,
      temperatureMinC: getDailyValue(daily.temperature_2m_min as unknown[], index),
      temperatureMaxC: getDailyValue(daily.temperature_2m_max as unknown[], index),
      precipitationMm: getDailyValue(daily.precipitation_sum as unknown[], index),
      precipitationProbability: getDailyValue(
        daily.precipitation_probability_max as unknown[],
        index,
      ),
      weatherCode: getDailyValue(daily.weather_code as unknown[], index),
    };
  });
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    timezone: 'auto',
    forecast_days: String(FORECAST_DAYS),
    current:
      'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code',
    daily:
      'temperature_2m_min,temperature_2m_max,precipitation_sum,precipitation_probability_max,weather_code',
  });

  let response: Response;

  try {
    response = await fetch(`${FORECAST_URL}?${params.toString()}`);
  } catch {
    throw new WeatherServiceError('Não foi possível consultar a previsão do tempo.');
  }

  if (!response.ok) {
    throw new WeatherServiceError('Não foi possível consultar a previsão do tempo.');
  }

  let payload: OpenMeteoResponse;

  try {
    payload = (await response.json()) as OpenMeteoResponse;
  } catch {
    throw new WeatherServiceError('A resposta da previsão é inválida.');
  }

  if (!payload.current || !payload.daily) {
    throw new WeatherServiceError('A resposta da previsão está incompleta.');
  }

  const forecast = mapForecast(payload.daily);

  return {
    city,
    timezone: typeof payload.timezone === 'string' ? payload.timezone : '',
    currentDate: nullableString(payload.current.time) ?? forecast[0].date,
    current: mapCurrent(payload.current),
    forecast,
  };
}