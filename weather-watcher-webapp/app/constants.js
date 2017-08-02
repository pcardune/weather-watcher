export const FORECAST_BAD = 60;
export const FORECAST_OK = 85;
export const NUM_FORECAST_DAYS = 7;
export const OUR_EMAIL = 'thebears@goldilocksweather.com';
export const OUR_URL = 'goldilocksweather.com';
export const SCORE_COMPONENTS = {
  temp: {
    name: 'Temperature',
  },
  wind: {
    name: 'Wind Speed',
  },
  precip: {
    name: 'Chance of Rain',
  },
  precipQuantity: {
    name: 'Amount of Rain',
  },
};

export const SCORE_MULTIPLIERS = {
  red: 0,
  yellow: 2,
  green: 3,
};

export const DEFAULT_SCORE_CONFIG = {
  tempRange: [32, 45, 65, 75, 85],
  windRange: [0, 0, 0, 5, 20],
  precipRange: [0, 0, 0, 20, 50],
  quantityRange: [0, 0, 0, 0.03, 0.1],
};
