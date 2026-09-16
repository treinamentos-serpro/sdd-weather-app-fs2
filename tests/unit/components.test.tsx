import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import ForecastCard from '../../src/components/ForecastCard';
import SearchBar from '../../src/components/SearchBar';
import UnitToggle from '../../src/components/UnitToggle';
import type { Unit } from '../../src/types/weather';

const city = {
  id: 3448439,
  name: 'São Paulo',
  country: 'Brasil',
  region: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
};

const current = {
  temperatureC: 0,
  relativeHumidity: 68,
  windSpeedKmh: 11.2,
  surfacePressureHpa: 1015.7,
  precipitationMm: 0,
  weatherCode: 2,
};

function WeatherWithUnitToggle() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather city={city} current={current} unit={unit} />
    </>
  );
}

describe('SearchBar', () => {
  it('does not call onSearch when the input is empty', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar onSearch={onSearch} />);

    expect(screen.getByLabelText('Cidade')).toHaveValue('');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('calls onSearch with the entered term', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByLabelText('Cidade'), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledWith('São Paulo');
  });
});

describe('unit conversion', () => {
  it('displays 32° after selecting Fahrenheit for a temperature of 0°C', async () => {
    const user = userEvent.setup();

    render(<WeatherWithUnitToggle />);

    await user.click(screen.getByRole('button', { name: 'Usar Fahrenheit' }));

    expect(screen.getByRole('heading', { name: 'Temperatura atual: 32°F' })).toBeVisible();
  });

  it('converts the daily min/max forecast temperatures to Fahrenheit', () => {
    const day = {
      date: '2026-09-16',
      temperatureMinC: 0,
      temperatureMaxC: 20,
      precipitationMm: 0,
      precipitationProbability: 10,
      weatherCode: 2,
    };

    render(<ForecastCard day={day} timezone="America/Sao_Paulo" unit="fahrenheit" />);

    expect(screen.getByText('32°F')).toBeVisible();
    expect(screen.getByText('68°F')).toBeVisible();
  });
});

describe('partial response fallback', () => {
  it('shows "—" for missing optional current weather metrics', () => {
    const partialCurrent = {
      temperatureC: 22.4,
      relativeHumidity: null,
      windSpeedKmh: null,
      surfacePressureHpa: null,
      precipitationMm: 0,
      weatherCode: null,
    };

    render(<CurrentWeather city={city} current={partialCurrent} unit="celsius" />);

    expect(screen.getAllByText('—')).toHaveLength(3);
  });

  it('shows "—" for missing optional forecast day metrics', () => {
    const partialDay = {
      date: '2026-09-16',
      temperatureMinC: null,
      temperatureMaxC: null,
      precipitationMm: null,
      precipitationProbability: null,
      weatherCode: null,
    };

    render(<ForecastCard day={partialDay} timezone="America/Sao_Paulo" unit="celsius" />);

    expect(screen.getAllByText('—')).toHaveLength(3);
  });
});
