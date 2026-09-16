import { expect, test } from '@playwright/test';

const geocodingResponse = {
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
};

const forecastResponse = {
  timezone: 'America/Sao_Paulo',
  current: {
    time: '2026-09-16T12:00',
    temperature_2m: 0,
    relative_humidity_2m: 68,
    wind_speed_10m: 11.2,
    surface_pressure: 1015.7,
    precipitation: 0,
    weather_code: 2,
  },
  daily: {
    time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
    temperature_2m_min: [0, 1, 2, 3, 4],
    temperature_2m_max: [5, 6, 7, 8, 9],
    precipitation_sum: [0, 1.4, 3.2, 0, 0],
    precipitation_probability_max: [12, 46, 72, 18, 8],
    weather_code: [2, 61, 63, 1, 0],
  },
};

test('searches a city and converts the displayed temperature to Fahrenheit', async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({ json: geocodingResponse });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({ json: forecastResponse });
  });

  await page.goto('/');
  await page.getByLabel('Cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByText('São Paulo, São Paulo, Brasil')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();

  await page.getByRole('button', { name: 'Usar Fahrenheit' }).click();

  await expect(page.getByRole('heading', { name: 'Temperatura atual: 32°F' })).toBeVisible();
});
