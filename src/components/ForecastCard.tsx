import { formatDayLabel, formatPercentage } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCodeInfo } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
  timezone: string;
}

export default function ForecastCard({ day, unit, timezone }: ForecastCardProps) {
  const weather = getWeatherCodeInfo(day.weatherCode);
  const maxTemperature = formatTemperature(day.temperatureMaxC, unit);
  const minTemperature = formatTemperature(day.temperatureMinC, unit);
  const rainProbability = formatPercentage(day.precipitationProbability);

  return (
    <article
      aria-label={`Previsão para ${formatDayLabel(day.date, timezone)}`}
      className="min-w-0 rounded-lg border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/20 backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold capitalize text-white">
            {formatDayLabel(day.date, timezone)}
          </h3>
          <p className="mt-1 text-xs text-white/75">{weather.condition}</p>
        </div>
        <span aria-hidden="true" className="text-3xl leading-none">
          {weather.icon}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs font-medium uppercase text-white/70">Máx</span>
          <span className="font-semibold text-white">{maxTemperature}</span>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs font-medium uppercase text-white/70">Mín</span>
          <span className="font-semibold text-white">{minTemperature}</span>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-white/10 pt-3">
          <span className="text-xs font-medium uppercase text-white/70">Chuva</span>
          <span className="font-semibold text-accent-400">{rainProbability}</span>
        </div>
      </div>
    </article>
  );
}
