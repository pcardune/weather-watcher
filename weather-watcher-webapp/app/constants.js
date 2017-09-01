export const FORECAST_BAD = 60;
export const FORECAST_OK = 85;
export const NUM_FORECAST_DAYS = 7;
export const OUR_EMAIL = 'thebears@goldilocksweather.com';
export const OUR_URL = 'goldilocksweather.com';
export const SCORE_COMPONENTS = {
  temp: {
    name: 'Temperature',
    high: 'hot',
    low: 'cold',
  },
  wind: {
    name: 'Wind Speed',
    high: 'windy',
    low: 'calm',
  },
  precip: {
    name: 'Chance of Rain',
    high: 'rainy',
    low: 'dry',
  },
  precipQuantity: {
    name: 'Amount of Rain',
    high: 'rainy',
    low: 'dry',
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

export const DEFAULT_COMPARISON_ID = 'wa-climb-crags';

export const FB_APP_ID = '270286390143694';
