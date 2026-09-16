import { describe, expect, it } from 'vitest';
import { getWeatherCodeInfo } from '../../src/lib/weatherCodes';

describe('weather codes', () => {
  it('returns the condition and icon for a known code', () => {
    expect(getWeatherCodeInfo(61)).toEqual({
      icon: '🌧️',
      condition: 'Chuva leve',
    });
  });

  it('returns the fallback for an unknown code', () => {
    expect(getWeatherCodeInfo(999)).toEqual({
      icon: '🌡️',
      condition: 'Condição indisponível',
    });
  });
});
