import {
  convertTemperatureFromCelsius,
  formatTemperature,
  unitLabel,
} from '../../src/lib/temperature';

describe('temperature utilities', () => {
  describe('convertTemperatureFromCelsius', () => {
    it.each([
      [0, 32],
      [100, 212],
      [-40, -40],
    ])('converts %d°C to %d°F', (temperatureC, expected) => {
      expect(convertTemperatureFromCelsius(temperatureC, 'fahrenheit')).toBe(expected);
    });

    it('keeps Celsius values unchanged', () => {
      expect(convertTemperatureFromCelsius(21.5, 'celsius')).toBe(21.5);
    });
  });

  describe('formatTemperature', () => {
    it('rounds Celsius values to one decimal and adds the Celsius symbol', () => {
      expect(formatTemperature(21.56, 'celsius')).toBe('21,6°C');
    });

    it('rounds converted Fahrenheit values to one decimal and adds the Fahrenheit symbol', () => {
      expect(formatTemperature(20.56, 'fahrenheit')).toBe('69°F');
    });

    it('formats null temperatures as an em dash', () => {
      expect(formatTemperature(null, 'celsius')).toBe('—');
    });
  });

  describe('unitLabel', () => {
    it.each([
      ['celsius', '°C'],
      ['fahrenheit', '°F'],
    ] as const)('returns %s as %s', (unit, expected) => {
      expect(unitLabel(unit)).toBe(expected);
    });
  });
});
