import { useCallback, useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string;
  query: string;
  search: (name: string) => void;
  selectCity: (city: City) => void;
  retry: () => void;
}

type LastOperation = { type: 'search'; name: string } | { type: 'selectCity'; city: City } | null;

const DEFAULT_ERROR_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.';

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const lastOperationRef = useRef<LastOperation>(null);

  const loadWeather = useCallback(async (city: City) => {
    setStatus('loading');

    try {
      const weather = await getWeather(city);
      setData(weather);
      setStatus('success');
    } catch (err) {
      setError(err instanceof WeatherServiceError ? err.message : DEFAULT_ERROR_MESSAGE);
      setStatus('error');
    }
  }, []);

  const runSearch = useCallback(
    async (name: string) => {
      lastOperationRef.current = { type: 'search', name };
      setQuery(name);
      setStatus('loading');

      let results: City[];

      try {
        results = await searchCities(name);
      } catch (err) {
        setError(err instanceof WeatherServiceError ? err.message : DEFAULT_ERROR_MESSAGE);
        setStatus('error');
        return;
      }

      setCities(results);

      if (results.length === 0) {
        setData(null);
        setStatus('empty');
        return;
      }

      await loadWeather(results[0]);
    },
    [loadWeather],
  );

  const search = useCallback(
    (name: string) => {
      void runSearch(name);
    },
    [runSearch],
  );

  const selectCity = useCallback(
    (city: City) => {
      lastOperationRef.current = { type: 'selectCity', city };
      void loadWeather(city);
    },
    [loadWeather],
  );

  const retry = useCallback(() => {
    const lastOperation = lastOperationRef.current;

    if (!lastOperation) {
      return;
    }

    if (lastOperation.type === 'search') {
      void runSearch(lastOperation.name);
      return;
    }

    void loadWeather(lastOperation.city);
  }, [loadWeather, runSearch]);

  return { status, data, cities, error, query, search, selectCity, retry };
}
