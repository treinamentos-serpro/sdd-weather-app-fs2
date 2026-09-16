export interface WeatherCodeInfo {
  icon: string;
  condition: string;
}

const weatherCodes: Record<number, WeatherCodeInfo> = {
  0: { icon: '☀️', condition: 'Céu limpo' },
  1: { icon: '🌤️', condition: 'Principalmente limpo' },
  2: { icon: '⛅', condition: 'Parcialmente nublado' },
  3: { icon: '☁️', condition: 'Nublado' },
  45: { icon: '🌫️', condition: 'Neblina' },
  48: { icon: '🌫️', condition: 'Neblina com geada' },
  51: { icon: '🌦️', condition: 'Garoa leve' },
  53: { icon: '🌦️', condition: 'Garoa moderada' },
  55: { icon: '🌧️', condition: 'Garoa intensa' },
  61: { icon: '🌧️', condition: 'Chuva leve' },
  63: { icon: '🌧️', condition: 'Chuva moderada' },
  65: { icon: '⛈️', condition: 'Chuva forte' },
  80: { icon: '🌦️', condition: 'Pancadas leves' },
  81: { icon: '🌧️', condition: 'Pancadas moderadas' },
  82: { icon: '⛈️', condition: 'Pancadas fortes' },
  95: { icon: '⛈️', condition: 'Trovoadas' },
};

const unavailableWeatherCode: WeatherCodeInfo = {
  icon: '🌡️',
  condition: 'Condição indisponível',
};

export function getWeatherCodeInfo(weatherCode: number | null) {
  if (weatherCode === null) {
    return unavailableWeatherCode;
  }

  return weatherCodes[weatherCode] ?? unavailableWeatherCode;
}
