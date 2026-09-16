import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const GEOCODING_RESULT_COUNT = 10;
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const FORECAST_DAYS = 5;

const FETCH_TIMEOUT_MS = 10_000;

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

const OFFLINE_MESSAGE = 'Sem conexão com a internet. Verifique sua rede e tente novamente.';
const TIMEOUT_MESSAGE = 'A busca demorou mais que o esperado. Tente novamente.';
const NETWORK_ERROR_MESSAGE =
  'Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.';

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

function describeHttpError(status: number, fallbackMessage: string): string {
  if (status === 429) {
    return 'Muitas requisições em pouco tempo. Aguarde um instante e tente novamente.';
  }

  if (status >= 500) {
    return 'O serviço de clima está indisponível no momento. Tente novamente em instantes.';
  }

  return fallbackMessage;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  if (isOffline()) {
    throw new WeatherServiceError(OFFLINE_MESSAGE);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new WeatherServiceError(TIMEOUT_MESSAGE);
    }
    throw new WeatherServiceError(NETWORK_ERROR_MESSAGE);
  } finally {
    clearTimeout(timeoutId);
  }
}

interface GeocodingResult {
  id?: unknown;
  name?: unknown;
  country?: unknown;
  admin1?: unknown;
  latitude?: unknown;
  longitude?: unknown;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

function mapResult(result: GeocodingResult): City | null {
  if (
    typeof result.id !== 'number' ||
    typeof result.name !== 'string' ||
    typeof result.latitude !== 'number' ||
    typeof result.longitude !== 'number'
  ) {
    return null;
  }

  return {
    id: result.id,
    name: result.name,
    country: typeof result.country === 'string' ? result.country : '',
    region: typeof result.admin1 === 'string' ? result.admin1 : undefined,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

export async function searchCities(name: string): Promise<City[]> {
  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return [];
  }

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(trimmedName)}&count=${GEOCODING_RESULT_COUNT}&language=pt&format=json`;

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError(
      describeHttpError(response.status, 'Não foi possível buscar as localidades.'),
    );
  }

  let payload: GeocodingResponse;

  try {
    payload = (await response.json()) as GeocodingResponse;
  } catch {
    throw new WeatherServiceError('A resposta da busca de localidades é inválida.');
  }

  if (!Array.isArray(payload.results)) {
    return [];
  }

  return payload.results.map(mapResult).filter((city): city is City => city !== null);
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

function isValidTimezone(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0) {
    return false;
  }

  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

function getDailyValue(values: unknown, index: number): number | null {
  return Array.isArray(values) ? nullableNumber(values[index]) : null;
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
    precipitationMm: nullableNumber(current.precipitation) ?? 0,
    weatherCode: nullableNumber(current.weather_code),
  };
}

function mapForecast(daily: NonNullable<OpenMeteoResponse['daily']>): ForecastDay[] {
  if (!isArray(daily.time) || daily.time.length < FORECAST_DAYS) {
    throw new WeatherServiceError('A resposta da previsão está incompleta.');
  }

  return daily.time.slice(0, FORECAST_DAYS).map((date, index) => {
    if (typeof date !== 'string' || date.length === 0) {
      throw new WeatherServiceError('A resposta da previsão está incompleta.');
    }

    return {
      date,
      temperatureMinC: getDailyValue(daily.temperature_2m_min, index),
      temperatureMaxC: getDailyValue(daily.temperature_2m_max, index),
      precipitationMm: getDailyValue(daily.precipitation_sum, index),
      precipitationProbability: getDailyValue(daily.precipitation_probability_max, index),
      weatherCode: getDailyValue(daily.weather_code, index),
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

  const forecastResponse = await fetchWithTimeout(`${FORECAST_URL}?${params.toString()}`);

  if (!forecastResponse.ok) {
    throw new WeatherServiceError(
      describeHttpError(forecastResponse.status, 'Não foi possível consultar a previsão do tempo.'),
    );
  }

  let forecastPayload: OpenMeteoResponse;

  try {
    forecastPayload = (await forecastResponse.json()) as OpenMeteoResponse;
  } catch {
    throw new WeatherServiceError('A resposta da previsão é inválida.');
  }

  if (
    !forecastPayload.current ||
    !forecastPayload.daily ||
    !isValidTimezone(forecastPayload.timezone) ||
    typeof forecastPayload.current.time !== 'string' ||
    forecastPayload.current.time.length === 0
  ) {
    throw new WeatherServiceError('A resposta da previsão está incompleta.');
  }

  const forecast = mapForecast(forecastPayload.daily);

  return {
    city,
    timezone: forecastPayload.timezone,
    currentDate: forecastPayload.current.time,
    current: mapCurrent(forecastPayload.current),
    forecast,
  };
}
