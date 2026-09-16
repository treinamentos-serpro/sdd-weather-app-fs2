import { useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

const appTitleClassName = 'mt-1 text-3xl font-bold tracking-normal text-white';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { status, data, error, search, retry } = useWeather();
  const mainRef = useRef<HTMLElement>(null);
  const content = renderContent();

  useEffect(() => {
    if (status !== 'idle') {
      mainRef.current?.focus();
    }
  }, [status]);

  function renderContent() {
    switch (status) {
      case 'loading':
        return <LoadingState />;
      case 'empty':
        return (
          <EmptyState
            hint="Tente buscar por outra cidade ou verifique a grafia digitada."
            title="Nenhuma cidade encontrada"
          />
        );
      case 'error':
        return <ErrorState message={error} onRetry={retry} />;
      case 'success':
        return data ? (
          <div className="space-y-6">
            <CurrentWeather city={data.city} current={data.current} unit={unit} />
            <ForecastList forecast={data.forecast} timezone={data.timezone} unit={unit} />
          </div>
        ) : null;
      case 'idle':
        return (
          <EmptyState
            hint="Busque uma cidade para visualizar o clima atual e a previsão dos próximos dias."
            title="Pronto para consultar o clima"
          />
        );
    }
  }

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <a
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-md focus:bg-accent-500 focus:px-4 focus:py-3 focus:font-semibold focus:text-night-900"
          href="#weather-results"
        >
          Ir para o resultado da consulta
        </a>
        <header className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase text-accent-400">SDD Weather</p>
              <h1 className={appTitleClassName}>Previsão do tempo</h1>
            </div>
            <UnitToggle onChange={setUnit} unit={unit} />
          </div>
          <SearchBar disabled={status === 'loading'} onSearch={search} />
        </header>

        <main
          aria-busy={status === 'loading'}
          className="flex-1 py-8 focus:outline-none"
          id="weather-results"
          ref={mainRef}
          tabIndex={-1}
        >
          {content}
        </main>
      </div>
    </div>
  );
}
