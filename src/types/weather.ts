type TemperatureUnit = 'celsius' | 'fahrenheit';

export type Unit = TemperatureUnit;

export interface City {
  id: number | string;
  name: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperatureC: number | null;
  relativeHumidity: number | null;
  windSpeedKmh: number | null;
  surfacePressureHpa: number | null;
  precipitationMm: number | null;
  weatherCode: number | null;
}

export interface ForecastDay {
  date: string;
  temperatureMinC: number | null;
  temperatureMaxC: number | null;
  precipitationMm: number | null;
  precipitationProbability: number | null;
  weatherCode: number | null;
}

export interface WeatherData {
  city: City;
  timezone: string;
  currentDate: string;
  current: CurrentWeather;
  forecast: ForecastDay[];
}
