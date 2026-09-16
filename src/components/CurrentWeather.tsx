import { memo, useMemo } from 'react';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCodeInfo } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

interface MetricItem {
  label: string;
  value: string;
}

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

function formatMetric(value: number | null, suffix: string) {
  if (value === null || !Number.isFinite(value)) {
    return '—';
  }

  return `${numberFormatter.format(value)} ${suffix}`;
}

const MetricCard = memo(function MetricCard({ label, value }: MetricItem) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-md">
      <dt className="text-xs font-medium uppercase text-white/70">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-white">{value}</dd>
    </div>
  );
});

function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const weather = getWeatherCodeInfo(current.weatherCode);
  const locationLabel = [city.name, city.region, city.country].filter(Boolean).join(', ');
  const metrics: MetricItem[] = useMemo(
    () => [
      {
        label: 'Umidade',
        value: formatMetric(current.relativeHumidity, '%'),
      },
      {
        label: 'Vento',
        value: formatMetric(current.windSpeedKmh, 'km/h'),
      },
      {
        label: 'Precipitação',
        value: formatMetric(current.precipitationMm, 'mm'),
      },
      {
        label: 'Pressão',
        value: formatMetric(current.surfacePressureHpa, 'hPa'),
      },
    ],
    [
      current.relativeHumidity,
      current.windSpeedKmh,
      current.precipitationMm,
      current.surfacePressureHpa,
    ],
  );

  return (
    <section
      aria-labelledby="current-weather-title"
      className="rounded-lg border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-6"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="break-words text-sm font-medium text-white/75">{locationLabel}</p>
          <h2
            id="current-weather-title"
            className="mt-2 text-5xl font-bold tracking-normal text-white min-[360px]:text-6xl sm:text-7xl"
            aria-label={`Temperatura atual: ${formatTemperature(current.temperatureC, unit)}`}
          >
            {formatTemperature(current.temperatureC, unit)}
          </h2>
          <p className="mt-3 text-lg font-medium text-white/85">{weather.condition}</p>
        </div>
        <div aria-hidden="true" className="text-7xl leading-none sm:text-8xl">
          {weather.icon}
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </dl>
    </section>
  );
}

export default memo(CurrentWeather);
