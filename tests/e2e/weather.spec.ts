import { expect, type Page, test } from '@playwright/test';

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

async function mockGeocoding(page: Page, json: unknown) {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({ json });
  });
}

async function mockForecast(page: Page, json: unknown) {
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({ json });
  });
}

test('searches a city and converts the displayed temperature to Fahrenheit', async ({ page }) => {
  await mockGeocoding(page, geocodingResponse);
  await mockForecast(page, forecastResponse);

  await page.goto('/');
  await page.getByLabel('Cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByText('São Paulo, São Paulo, Brasil', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();

  await page.getByRole('button', { name: 'Usar Fahrenheit' }).click();

  await expect(page.getByRole('heading', { name: 'Temperatura atual: 32°F' })).toBeVisible();
});

test('shows "Nenhuma cidade encontrada" when geocoding returns no results', async ({ page }) => {
  await mockGeocoding(page, { results: [] });

  await page.goto('/');
  await page.getByLabel('Cidade').fill('Cidade Inexistente');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(
    page.getByRole('heading', { name: 'Nenhuma cidade encontrada', exact: true }),
  ).toBeVisible();
});

test('preserves special characters in the geocoding query', async ({ page }) => {
  let requestedUrl = '';
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    requestedUrl = route.request().url();
    await route.fulfill({ json: { results: [] } });
  });

  await page.goto('/');
  await page.getByLabel('Cidade').fill("L'Aquila-São José");
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(
    page.getByRole('heading', { name: 'Nenhuma cidade encontrada', exact: true }),
  ).toBeVisible();
  expect(new URL(requestedUrl).searchParams.get('name')).toBe("L'Aquila-São José");
});

test('shows an error when the forecast response is incomplete', async ({ page }) => {
  await mockGeocoding(page, geocodingResponse);
  await mockForecast(page, {
    ...forecastResponse,
    daily: { ...forecastResponse.daily, time: forecastResponse.daily.time.slice(0, 4) },
  });

  await page.goto('/');
  await page.getByLabel('Cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(
    page.getByRole('heading', { name: 'Não foi possível carregar o clima' }),
  ).toBeVisible();
  await expect(page.getByText('A resposta da previsão está incompleta.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).not.toBeVisible();
});

test.describe('mobile viewport', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('searches a city and renders the weather correctly on mobile', async ({
    page,
  }, testInfo) => {
    // The "mobile" project already emulates an iPhone 13 (touch + UA); running the
    // fixed 375x812 viewport there too would mix inconsistent device emulations
    // for no extra coverage, so this check is limited to the desktop-engine project.
    testInfo.skip(testInfo.project.name === 'mobile', 'already covered by the mobile project');

    await mockGeocoding(page, geocodingResponse);
    await mockForecast(page, forecastResponse);

    await page.goto('/');
    await page.getByLabel('Cidade').fill('São Paulo');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByText('São Paulo, São Paulo, Brasil', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Temperatura atual: 0°C' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
  });
});
