import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';

const city = {
  id: 3448439,
  name: 'São Paulo',
  country: 'Brasil',
  region: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
};

const dailyForecast = {
  time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
  temperature_2m_min: [16.2, 17.1, 18, 17.8, 19.3],
  temperature_2m_max: [25.1, 26, 27.4, 24.8, 28.2],
  precipitation_sum: [0, 1.4, 3.2, 0, 0],
  precipitation_probability_max: [12, 46, 72, 18, 8],
  weather_code: [2, 61, 63, 1, 0],
};

function jsonResponse(payload: unknown, ok = true): Response {
  return {
    ok,
    json: vi.fn().mockResolvedValue(payload),
  } as unknown as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('searchCities', () => {
  it('returns an empty list without requesting an empty input', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('   ')).resolves.toEqual([]);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps valid geocoding results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          results: [
            {
              id: 3448439,
              name: 'São Paulo',
              country: 'Brasil',
              admin1: 'São Paulo',
              latitude: -23.55,
              longitude: -46.63,
            },
          ],
        }),
      ),
    );

    await expect(searchCities('São Paulo')).resolves.toEqual([city]);
  });

  it('returns an empty list when results is absent', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({})));

    await expect(searchCities('São Paulo')).resolves.toEqual([]);
  });

  it('throws WeatherServiceError for a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, false)));

    await expect(searchCities('São Paulo')).rejects.toThrow(WeatherServiceError);
  });

  it('throws WeatherServiceError when the request times out', async () => {
    const abortError = new DOMException('Aborted', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

    await expect(searchCities('São Paulo')).rejects.toThrow('A requisição demorou demais.');
  });

  it('throws WeatherServiceError on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(searchCities('São Paulo')).rejects.toThrow(WeatherServiceError);
  });
});

describe('getWeather', () => {
  it('maps current weather and five forecast days, converting null precipitation to zero', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          timezone: 'America/Sao_Paulo',
          current: {
            time: '2026-09-16T12:00',
            temperature_2m: 22.4,
            relative_humidity_2m: 68,
            wind_speed_10m: 11.2,
            surface_pressure: 1015.7,
            precipitation: null,
            weather_code: 2,
          },
          daily: dailyForecast,
        }),
      ),
    );

    const weather = await getWeather(city);

    expect(weather).toMatchObject({
      city,
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
    });
    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast[1]).toEqual({
      date: '2026-09-17',
      temperatureMinC: 17.1,
      temperatureMaxC: 26,
      precipitationMm: 1.4,
      precipitationProbability: 46,
      weatherCode: 61,
    });
  });

  it.each([
    { timezone: 'America/Sao_Paulo', daily: dailyForecast },
    {
      timezone: 'America/Sao_Paulo',
      current: { time: '2026-09-16T12:00' },
    },
  ])('throws WeatherServiceError for an incomplete response', async (payload) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(payload)));

    await expect(getWeather(city)).rejects.toThrow(WeatherServiceError);
  });

  it('throws WeatherServiceError when the forecast API responds with a failure status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, false)));

    await expect(getWeather(city)).rejects.toThrow(WeatherServiceError);
  });

  it('throws WeatherServiceError when fewer than five daily dates are returned', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          timezone: 'America/Sao_Paulo',
          current: {
            time: '2026-09-16T12:00',
            temperature_2m: 22.4,
            weather_code: 2,
          },
          daily: { ...dailyForecast, time: dailyForecast.time.slice(0, 4) },
        }),
      ),
    );

    await expect(getWeather(city)).rejects.toThrow('A resposta da previsão está incompleta.');
  });

  it('throws WeatherServiceError when a daily date is an empty string', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          timezone: 'America/Sao_Paulo',
          current: {
            time: '2026-09-16T12:00',
            temperature_2m: 22.4,
            weather_code: 2,
          },
          daily: {
            ...dailyForecast,
            time: ['2026-09-16', '', '2026-09-18', '2026-09-19', '2026-09-20'],
          },
        }),
      ),
    );

    await expect(getWeather(city)).rejects.toThrow(WeatherServiceError);
  });

  it('falls back to null for missing optional current weather fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          timezone: 'America/Sao_Paulo',
          current: {
            time: '2026-09-16T12:00',
            temperature_2m: 22.4,
          },
          daily: dailyForecast,
        }),
      ),
    );

    const weather = await getWeather(city);

    expect(weather.current).toEqual({
      temperatureC: 22.4,
      relativeHumidity: null,
      windSpeedKmh: null,
      surfacePressureHpa: null,
      precipitationMm: 0,
      weatherCode: null,
    });
  });

  it('falls back to null for missing optional daily forecast fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          timezone: 'America/Sao_Paulo',
          current: {
            time: '2026-09-16T12:00',
            temperature_2m: 22.4,
            weather_code: 2,
          },
          daily: { time: dailyForecast.time },
        }),
      ),
    );

    const weather = await getWeather(city);

    expect(weather.forecast[0]).toEqual({
      date: '2026-09-16',
      temperatureMinC: null,
      temperatureMaxC: null,
      precipitationMm: null,
      precipitationProbability: null,
      weatherCode: null,
    });
  });
});
