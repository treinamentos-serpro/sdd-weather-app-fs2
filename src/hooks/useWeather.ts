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

function getErrorMessage(error: unknown): string {
  return error instanceof WeatherServiceError ? error.message : DEFAULT_ERROR_MESSAGE;
}

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const lastOperationRef = useRef<LastOperation>(null);
  const operationIdRef = useRef(0);

  const loadWeather = useCallback(async (city: City) => {
    const operationId = ++operationIdRef.current;
    lastOperationRef.current = { type: 'selectCity', city };
    setStatus('loading');
    setError('');

    try {
      const weather = await getWeather(city);
      if (operationId !== operationIdRef.current) {
        return;
      }

      setData(weather);
      setStatus('success');
      setError('');
    } catch (err) {
      if (operationId !== operationIdRef.current) {
        return;
      }

      setError(getErrorMessage(err));
      setStatus('error');
    }
  }, []);

  const runSearch = useCallback(
    async (name: string) => {
      const operationId = ++operationIdRef.current;
      lastOperationRef.current = { type: 'search', name };
      setQuery(name);
      setCities([]);
      setError('');
      setStatus('loading');

      let results: City[];

      try {
        results = await searchCities(name);
      } catch (err) {
        if (operationId !== operationIdRef.current) {
          return;
        }

        setError(getErrorMessage(err));
        setStatus('error');
        return;
      }

      if (operationId !== operationIdRef.current) {
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
