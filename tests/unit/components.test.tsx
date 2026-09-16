import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
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
});
