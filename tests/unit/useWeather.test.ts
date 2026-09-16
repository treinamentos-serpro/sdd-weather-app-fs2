import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';

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

const forecastPayload = {
  timezone: 'America/Sao_Paulo',
  current: {
    time: '2026-09-16T12:00',
    temperature_2m: 22.4,
    relative_humidity_2m: 68,
    wind_speed_10m: 11.2,
    surface_pressure: 1015.7,
    precipitation: 0,
    weather_code: 2,
  },
  daily: dailyForecast,
};

function jsonResponse(payload: unknown, ok = true): Response {
  return {
    ok,
    json: vi.fn().mockResolvedValue(payload),
  } as unknown as Response;
}

function geocodingResponse() {
  return jsonResponse({
    results: [
      {
        id: city.id,
        name: city.name,
        country: city.country,
        admin1: city.region,
        latitude: city.latitude,
        longitude: city.longitude,
      },
    ],
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('retry', () => {
  it('retries the failed search and clears the error on success', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, false))
      .mockResolvedValueOnce(geocodingResponse())
      .mockResolvedValueOnce(jsonResponse(forecastPayload));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useWeather());

    act(() => {
      result.current.search('São Paulo');
    });

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).not.toBe('');

    act(() => {
      result.current.retry();
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.error).toBe('');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('retries only the failed weather lookup, not the search', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(geocodingResponse())
      .mockResolvedValueOnce(jsonResponse({}, false))
      .mockResolvedValueOnce(jsonResponse(forecastPayload));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useWeather());

    act(() => {
      result.current.search('São Paulo');
    });

    await waitFor(() => expect(result.current.status).toBe('error'));

    act(() => {
      result.current.retry();
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('performs exactly one request per retry trigger even when it fails again', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, false));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useWeather());

    act(() => {
      result.current.search('São Paulo');
    });

    await waitFor(() => expect(result.current.status).toBe('error'));
    const callsBeforeRetry = fetchMock.mock.calls.length;

    act(() => {
      result.current.retry();
    });

    await waitFor(() => expect(fetchMock.mock.calls.length).toBe(callsBeforeRetry + 1));
    expect(result.current.status).toBe('error');
    expect(result.current.error).not.toBe('');
  });
});

describe('out-of-order responses', () => {
  it('discards a stale search response that resolves after a newer search', async () => {
    let resolveFirst!: (response: Response) => void;
    const firstRequest = new Promise<Response>((resolve) => {
      resolveFirst = resolve;
    });

    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(firstRequest)
      .mockResolvedValueOnce(jsonResponse({}));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useWeather());

    act(() => {
      result.current.search('Sao Paulo');
    });
    act(() => {
      result.current.search('Rio de Janeiro');
    });

    await waitFor(() => expect(result.current.status).toBe('empty'));

    act(() => {
      resolveFirst(geocodingResponse());
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(result.current.status).toBe('empty');
    expect(result.current.cities).toEqual([]);
  });
});

describe('offline network', () => {
  it('shows a friendly offline message and recovers once connectivity returns', async () => {
    vi.stubGlobal('navigator', { onLine: false });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useWeather());

    act(() => {
      result.current.search('São Paulo');
    });

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe(
      'Sem conexão com a internet. Verifique sua rede e tente novamente.',
    );
    expect(fetchMock).not.toHaveBeenCalled();

    (navigator as { onLine: boolean }).onLine = true;
    fetchMock
      .mockResolvedValueOnce(geocodingResponse())
      .mockResolvedValueOnce(jsonResponse(forecastPayload));

    act(() => {
      result.current.retry();
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.error).toBe('');
  });
});
